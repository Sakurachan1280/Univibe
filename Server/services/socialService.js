const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Playlist = require('../models/Playlist');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

function createVietnameseRegex(keyword) {
  let str = escapeRegExp(keyword);

  str = str.replace(/a/gi, '[aàáạảãâầấậẩẫăằắặẳẵ]');
  str = str.replace(/e/gi, '[eèéẹẻẽêềếệểễ]');
  str = str.replace(/i/gi, '[iìíịỉĩ]');
  str = str.replace(/o/gi, '[oòóọỏõôồốộổỗơờớợởỡ]');
  str = str.replace(/u/gi, '[uùúụủũưừứựửữ]');
  str = str.replace(/y/gi, '[yỳýỵỷỹ]');
  str = str.replace(/d/gi, '[dđ]');
  str = str.replace(/D/g, '[DĐ]');
  str = str.replace(/\s+/g, '\\s+');
  str = str.replace(/-/g, '[-_\\s]?');
  str = str.replace(/w/gi, '[wư]');
  str = str.replace(/[.,/#!$%^&*;:{}=_`~()]/g, '[.,/#!$%^&*;:{}=_`~()]?');

  return new RegExp(str, 'i');
}

// Tìm kiếm người dùng (chỉ role: user, bỏ admin)
const searchUsers = async (keyword, currentUserId) => {
  const searchRegex = createVietnameseRegex(keyword);
  
  const users = await User.find({
    $or: [
        { username: searchRegex }, 
        { email: searchRegex }, 
        { 'profile.display_name': searchRegex } 
    ],
    _id: { $ne: currentUserId },
    role: 'user' // Chỉ tìm user, không tìm admin
  })
  .select('username profile.display_name profile.avatar_url status.is_online');
  return users;
};

const sendFriendRequest = async (requesterId, recipientId) => {
  if (requesterId === recipientId) throw new Error("Cannot send request to yourself");

  const existing = await Friendship.findOne({
    $or: [
      { requester_id: requesterId, recipient_id: recipientId },
      { requester_id: recipientId, recipient_id: requesterId }
    ]
  });

  if (existing) {
    if (existing.status === 'blocked') throw new Error("Unable to send request");
    if (existing.status === 'accepted') throw new Error("You are already friends");
    throw new Error("Friend request already sent");
  }

  return await Friendship.create({
    requester_id: requesterId,
    recipient_id: recipientId,
    status: 'pending'
  });
};

const respondToRequest = async (userId, requestId, action) => {
  const friendship = await Friendship.findOne({ _id: requestId, recipient_id: userId, status: 'pending' });
  
  if (!friendship) throw new Error("Friend request not found or already handled");

  if (action === 'accept') {
    friendship.status = 'accepted';
    await friendship.save();
    return { message: "Friend request accepted", status: 'accepted' };
  } else if (action === 'reject') {
    await Friendship.deleteOne({ _id: requestId });
    return { message: "Friend request rejected", status: 'rejected' };
  }
};

const modifyRelation = async (userId, targetUserId, action) => {
  const friendship = await Friendship.findOne({
    $or: [
      { requester_id: userId, recipient_id: targetUserId },
      { requester_id: targetUserId, recipient_id: userId }
    ]
  });

  if (!friendship) throw new Error("Relationship not found");

  if (action === 'unfriend') {
    await Friendship.deleteOne({ _id: friendship._id });
    return { message: "Unfriended successfully" };
  } 
  
  if (action === 'block') {
    friendship.status = 'blocked';
    friendship.requester_id = userId; 
    friendship.recipient_id = targetUserId;
    await friendship.save();
    return { message: "User blocked" };
  }

  // Hủy lời mời kết bạn (người gửi hủy)
  if (action === 'cancel_request') {
    if (friendship.requester_id.toString() !== userId.toString()) {
      throw new Error("You are not the requester");
    }
    await Friendship.deleteOne({ _id: friendship._id });
    return { message: "Friend request cancelled" };
  }
};

const getUserProfile = async (targetUserId) => {
  const user = await User.findById(targetUserId).select('-password -fcm_token -settings');
  if (!user) throw new Error("User not found");

  const publicPlaylists = await Playlist.find({
    owner_id: targetUserId,
    is_public: true
  }).select('name cover_image tracks.length');

  return {
    profile: user,
    playlists: publicPlaylists
  };
};

const getPendingRequests = async (userId) => {
  return await Friendship.find({ recipient_id: userId, status: 'pending' })
    .populate('requester_id', 'username profile.display_name profile.avatar_url');
};

// Lấy danh sách bạn bè đã accepted
const getFriends = async (userId) => {
  const friendships = await Friendship.find({
    $or: [
      { requester_id: userId },
      { recipient_id: userId }
    ],
    status: 'accepted'
  })
  .populate('requester_id', 'username profile.display_name profile.avatar_url status.is_online')
  .populate('recipient_id', 'username profile.display_name profile.avatar_url status.is_online');

  // Lọc ra người bạn (không phải chính mình)
  const userIdStr = String(userId);
  return friendships.map(f => {
    const friend = String(f.requester_id._id) === userIdStr
      ? f.recipient_id
      : f.requester_id;
    return friend;
  });
};

// Lấy trạng thái quan hệ giữa currentUser và targetUser
const getFriendshipStatus = async (currentUserId, targetUserId) => {
  const friendship = await Friendship.findOne({
    $or: [
      { requester_id: currentUserId, recipient_id: targetUserId },
      { requester_id: targetUserId, recipient_id: currentUserId }
    ]
  });

  if (!friendship) {
    return { status: 'none', friendshipId: null };
  }

  if (friendship.status === 'accepted') {
    return { status: 'friends', friendshipId: friendship._id };
  }

  if (friendship.status === 'pending') {
    // Kiểm tra ai là người gửi
    if (friendship.requester_id.toString() === currentUserId.toString()) {
      return { status: 'pending_sent', friendshipId: friendship._id }; // Tôi đã gửi
    } else {
      return { status: 'pending_received', friendshipId: friendship._id }; // Tôi nhận được
    }
  }

  return { status: 'blocked', friendshipId: friendship._id };
};

module.exports = {
  searchUsers,
  sendFriendRequest,
  respondToRequest,
  modifyRelation,
  getUserProfile,
  getPendingRequests,
  getFriends,
  getFriendshipStatus
};