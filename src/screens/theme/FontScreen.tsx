import { useCallback, useEffect, useState } from "react";
import {
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useCommonStyles } from "../../styles/commonstyles";
import { Column, Row } from "../../tools";
import { useAuthStore } from "../../store/authStore";
import { AuthRepo } from "../../repositories/auth";
import { useHelper } from "../../utils/helper";
import { useTheme } from "../../infrastructure/theme";
import { fontMap, FontName } from "../../../assets/fonts";
import { ROUTES } from "../../enums/routes";

const FontScreen = () => {
  const navigation: any = useNavigation();
  const theme = useTheme();
  const commonStyles = useCommonStyles(theme);
  const { user, updateUser } = useAuthStore();
  const { themeColor } = useHelper();

  const fonts = Object.keys(fontMap) as FontName[];

  const [currentFont, setCurrentFont] = useState<FontName>(
    (user?.font as FontName) || fonts[0]
  );
  const [loading, setLoading] = useState(false);

  const handleFontChange = useCallback(
    async (font: FontName) => {
      if (!user?.userId || loading) return;
      setCurrentFont(font);
      setLoading(true);
      try {
        const res = await AuthRepo.updateFont({ userId: user.userId, font });
        if (res?.user) {
          updateUser(res.user);
          navigation.navigate(ROUTES.SPLASH);
        }
      } catch (error) {
        console.error("Update font error:", error);
      } finally {
        setLoading(false);
      }
    },
    [user, loading, updateUser]
  );

  useEffect(() => {
    if (user?.font && fonts.includes(user.font as FontName)) {
      setCurrentFont(user.font as FontName);
    }
  }, [user]);

  return (
    <ScreenWrapper title="Font" showBackbutton>
      <ScrollView>
        <Column gap={16} style={commonStyles.screenWrapper}>
          {fonts.map((font) => {
            const isSelected = font === currentFont;
            return (
              <TouchableOpacity
                key={font}
                onPress={() => handleFontChange(font)}
                activeOpacity={0.8}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected
                    ? themeColor.dark
                    : theme.colors.border,
                  paddingVertical: 16,
                  backgroundColor: isSelected
                    ? `${themeColor.light}/20`
                    : "transparent",
                }}
              >
                <Row justifyContent="center" alignItems="center">
                  <Text
                    style={{
                      fontFamily: `${font}Bold`,
                      fontSize: 18,
                      color: theme.colors.text,
                    }}
                  >
                    {font}
                  </Text>

                  {/* {isSelected && loading && (
                    <ActivityIndicator
                      size="small"
                      color={themeColor.dark}
                      style={{ marginLeft: 8 }}
                    />
                  )} */}
                </Row>
              </TouchableOpacity>
            );
          })}
        </Column>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default FontScreen;
