const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Friendship = require('../models/Friendship');
const Playlist = require('../models/Playlist');
const User = require('../models/User');

/**
 * GET /api/v1/notifications
 * Trả về danh sách thông báo tổng hợp từ:
 *  1. Tin nhắn chưa đọc (conversations có message chưa read)
 *  2. Lời mời kết bạn pending (recipient là user hiện tại)
 *  3. Albums mới do admin tạo trong 7 ngày gần đây
 */
const getNotifications = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    const userId = req.user.id;
    const notifications = [];

    // ─── 1. Tin nhắn chưa đọc ────────────────────────────────────────────────
    const conversations = await Conversation.find({ participants: userId })
      .sort({ updated_at: -1 })
      .populate('participants', 'username profile.display_name profile.avatar_url')
      .limit(20);

    for (const conv of conversations) {
      // Đếm số tin nhắn chưa đọc trong conversation này
      const unreadCount = await Message.countDocuments({
        conversation_id: conv._id,
        sender_id: { $ne: userId },
        read_by: { $ne: userId },
        is_revoked: false,
      });

      if (unreadCount > 0) {
        // Lấy tin nhắn cuối cùng chưa đọc
        const lastUnread = await Message.findOne({
          conversation_id: conv._id,
          sender_id: { $ne: userId },
          read_by: { $ne: userId },
          is_revoked: false,
        })
          .sort({ created_at: -1 })
          .populate('sender_id', 'username profile.display_name profile.avatar_url');

        if (lastUnread) {
          const sender = lastUnread.sender_id;
          const senderName =
            sender?.profile?.display_name || sender?.username || 'Ai đó';
          const avatarUrl = sender?.profile?.avatar_url || null;

          notifications.push({
            id: `msg_${conv._id}`,
            type: 'message',
            title: `Tin nhắn mới từ ${senderName}`,
            message:
              lastUnread.type === 'image'
                ? '📷 Đã gửi một ảnh'
                : lastUnread.type === 'music_card'
                ? '🎵 Đã chia sẻ một bài nhạc'
                : lastUnread.content || '...',
            avatar: avatarUrl,
            time: lastUnread.created_at,
            unread: true,
            conversationId: conv._id,
            senderId: sender?._id,
            unreadCount,
          });
        }
      }
    }

    // ─── 2. Lời mời kết bạn pending ──────────────────────────────────────────
    const pendingRequests = await Friendship.find({
      recipient_id: userId,
      status: 'pending',
    })
      .sort({ created_at: -1 })
      .populate('requester_id', 'username profile.display_name profile.avatar_url')
      .limit(10);

    for (const req of pendingRequests) {
      const requester = req.requester_id;
      if (!requester) continue;
      const senderName =
        requester.profile?.display_name || requester.username || 'Ai đó';
      const avatarUrl = requester.profile?.avatar_url || null;

      notifications.push({
        id: `friend_${req._id}`,
        type: 'friend_request',
        title: 'Lời mời kết bạn',
        message: `${senderName} muốn kết bạn với bạn`,
        avatar: avatarUrl,
        time: req.created_at,
        unread: true,
        friendshipId: req._id,
        requesterId: requester._id,
      });
    }

    // ─── 3. Albums mới (system_mix) trong 7 ngày ─────────────────────────────
    const currentUser = await User.findById(userId).select('viewed_album_ids').lean();
    const viewedAlbumIds = (currentUser?.viewed_album_ids || []).map(id => id.toString());

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newAlbums = await Playlist.find({
      type: 'system_mix',
      is_public: true,
      created_at: { $gte: sevenDaysAgo },
    })
      .sort({ created_at: -1 })
      .limit(5);

    for (const album of newAlbums) {
      // Bỏ qua album user đã xem
      if (viewedAlbumIds.includes(album._id.toString())) continue;

      notifications.push({
        id: `album_${album._id}`,
        type: 'new_album',
        title: 'Album mới vừa ra!',
        message: `"${album.name}" vừa được thêm vào UniVibe. Nghe ngay!`,
        avatar: album.cover_image || null,
        time: album.created_at,
        unread: true,
        albumId: album._id,
      });
    }

    // ─── Sắp xếp tất cả theo thời gian mới nhất ──────────────────────────────
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    // ─── Thống kê ─────────────────────────────────────────────────────────────
    const unreadCount = notifications.filter((n) => n.unread).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[NOTIFICATION ERROR]', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/v1/notifications/read-messages/:conversationId
 * Đánh dấu đã đọc tất cả tin nhắn trong conversation
 */
const markConversationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    await Message.updateMany(
      { conversation_id: conversationId, read_by: { $ne: userId } },
      { $addToSet: { read_by: userId } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/v1/notifications/read-friend/:friendshipId
 * Chấp nhận / từ chối lời mời kết bạn (action: 'accept' | 'reject')
 */
const respondFriendNotif = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;
    const { action } = req.body; // 'accept' | 'reject'

    const friendship = await Friendship.findOne({
      _id: friendshipId,
      recipient_id: userId,
      status: 'pending',
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Lời mời không tồn tại' });
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      res.json({ success: true, status: 'accepted' });
    } else {
      await friendship.deleteOne();
      res.json({ success: true, status: 'rejected' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/v1/notifications/read-album/:albumId
 * Đánh dấu user đã xem thông báo album → xoá khỏi danh sách thông báo
 */
const markAlbumRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { albumId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $addToSet: { viewed_album_ids: albumId },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, markConversationRead, respondFriendNotif, markAlbumRead };
