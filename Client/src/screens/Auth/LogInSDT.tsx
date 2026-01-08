import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppNavigation } from "../../navigation/useAppNavigation";


export default function LogInSDT(){
    const navigation = useAppNavigation();
    const [selectedCountry, setSelectedCountry] = useState('Việt Nam');
    return(
        <SafeAreaView className="flex-1 bg-black px-6">
            <View className="flex-1 px-5">
                <View className="pt-4 pb-8">
                    <TouchableOpacity className="w-10 h-10 items-center justify-center">
                        <Text className="text-white text-3xl">←</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-white text-2xl font-semibold mb-6">Nhập số điện thoại</Text>

                <TouchableOpacity  activeOpacity={0.7}>
                    <View className="bg-white rounded-xl px-4 py-4 flex-row items-center justify-between mb-6">
                        <Text className="text-black text-base font-medium">{selectedCountry}</Text>
                        <Text className="text-black text-xl">›</Text>
                    </View>
                    
                </TouchableOpacity>

                <Text className="text-white text-sm leading-6 mb-8">
                Chúng tôi sẽ gửi cho bạn mã để xác nhận số điện thoại.{'\n\n'}
                Đôi khi, chúng tôi có thể gửi cho bạn thông báo dựa trên dịch vụ.
                </Text>

                <View className="items-center">
                    <TouchableOpacity className="bg-white rounded-full px-12 py-4 min-w-[140px] items-center" activeOpacity={0.8}>
                        <Text className="text-black text-base font-semibold">Tiếp</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}