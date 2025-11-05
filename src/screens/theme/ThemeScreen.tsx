import { TouchableOpacity, ScrollView, Text } from "react-native";
import { Column, Row } from "../../tools";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useCommonStyles } from "../../styles/commonstyles";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../enums/routes";
import { AuthRepo } from "../../repositories/auth"; // ensure this path matches your structure
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../infrastructure/theme";

const colors = [
  // Calm & Trust
  { dark: "#3F87E9", light: "#6697D9" },

  // Energetic & Bold
  { dark: "#F6454B", light: "#FFA6B5" },

  // Passionate & Deep
  { dark: "#6d073a", light: "#9f798a" },

  // Minimal & Neutral
  { light: "#999999", dark: "#333333" },

  // Peaceful & Earthy
  { dark: "#1B4332", light: "#95D5B2" },

  // Optimistic & Sunny
  { dark: "#F59E0B", light: "#FCD34D" },

  // Mysterious & Luxurious
  { dark: "#4B0082", light: "#A78BFA" },

  // Energetic & Youthful
  { dark: "#FF006E", light: "#FFB3C6" },
];

const ThemeScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);

  const { user, updateUser } = useAuthStore();
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleThemeChange = async (index: number) => {
    if (!user?.userId) return;

    const selectedTheme = colors[index];
    setCurrentThemeIndex(index);
    setLoading(true);

    try {
      const res = await AuthRepo.updateTheme({
        userId: user.userId,
        theme: selectedTheme,
      });
      if (res?.user) {
        updateUser(res.user);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: ROUTES.SPLASH }],
          })
        );
      }
    } catch (error) {
      console.error("Update theme error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.theme) {
      const index = colors.findIndex(
        (theme) =>
          theme.dark === user.theme.dark && theme.light === user.theme.light
      );
      if (index !== -1) setCurrentThemeIndex(index);
    }
  }, [user]);

  return (
    <ScreenWrapper title="Theme" showBackbutton>
      <ScrollView>
        <Column gap={12} style={[commonStyles.screenWrapper]}>
          {colors.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => !loading && handleThemeChange(index)}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <LinearGradient
                colors={[item.dark, item.light]}
                style={{
                  height: 100,
                  width: "100%",
                }}
              >
                {currentThemeIndex === index && (
                  <Row
                    justifyContent="center"
                    alignItems="center"
                    style={commonStyles.fullFlex}
                  >
                    <Text
                      style={[commonStyles.titleText, commonStyles.whiteText]}
                    >
                      Selected
                    </Text>
                  </Row>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Column>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ThemeScreen;
