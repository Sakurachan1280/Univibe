
import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppNavigation } from "../../navigation/useAppNavigation";


export default function LogInSDT(){
    const navigation = useAppNavigation();
    return(
      <SafeAreaView className="flex-1 bg-black px-6">
        <TouchableOpacity className="mt-2 w-10 h-10 justify-center" activeOpacity={0.5} onPress={() => navigation.goBack()} >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold mt-5">Nhập số điện thoại</Text>

        <Pressable className="flex-row items-center justify-between bg-neutral-900 rounded-xl px-4 py-4 mt-6 border border-neutral-700 ">
          <Text className="text-white text-base">Việt Nam</Text>
          <Ionicons name="chevron-forward" size={22} color="white" />
        </Pressable>

        <View className="flex-row items-center bg-neutral-900 rounded-xl px-4 py-4 mt-4 border border-neutral-700">
          <Text className="text-white text-base mr-3">+84</Text>
          <TextInput placeholder="Số điện thoại" placeholderTextColor="#6b6b6b" keyboardType="number-pad" className="text-white flex-1 text-base"/>
        </View>

        <Text className="text-neutral-400 text-sm mt-4">Chúng tôi sẽ gửi cho bạn mã để xác nhận số điện thoại.</Text>

        <Text className="text-neutral-500 text-sm mt-1">Đôi khi, chúng tôi có thể gửi cho bạn thông báo dựa trên dịch vụ.</Text>

        <TouchableOpacity className="mt-10 bg-neutral-800 opacity-40 py-4 rounded-full items-center" activeOpacity={0.5} onPress={() => navigation.navigate("PhoneOTP")} >
          <Text className="text-neutral-400 text-base font-semibold">Tiếp</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
}