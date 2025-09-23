import {
  View,
  Text,
  FlatList,
  Modal,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomInput from "./customInput";
import { Column, Row } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import axios from "axios";
import CustomButton from "./customButton";
import { theme } from "../infrastructure/theme";
import ImageView from "react-native-image-viewing";
import { useHelper } from "../utils/helper";

const ImageModal = ({
  onChange,
  defaultImage,
  disabled,
  button,
}: {
  onChange?: (uri: string) => void;
  defaultImage?: string;
  disabled?: boolean;
  button?: React.ReactNode;
}) => {
  const { themeColor } = useHelper();
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(defaultImage ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setIsVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState({});

  const getImages = async () => {
    try {
      setLoading(true);
      setError("");

      const url = text
        ? `https://api.unsplash.com/search/photos?query=${text}&per_page=9&client_id=61NdYaS5S5HVnY7_fhiy2ryzbdOM0Mbyw83ltXUU2fg`
        : `https://api.unsplash.com/photos/random?count=9&client_id=61NdYaS5S5HVnY7_fhiy2ryzbdOM0Mbyw83ltXUU2fg`;

      const res = await axios.get(url);

      const images = text
        ? res.data.results.map((img: any) => img.urls.regular) // for search
        : res.data.map((img: any) => img.urls.regular); // for random

      setImages(images);
    } catch (err) {
      setError("Failed to load images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  const onSelect = () => {
    setSelectedImage(currentImage.uri);
    onChange?.(currentImage.uri);
    setShowModal(false);
  };

  return (
    <>
      <Row justifyContent="center">
        <Pressable
          disabled={disabled}
          onPress={() => setShowModal(true)}
          style={[
            !button && styles.imageWrapper,
            !button && styles.selectedImageWrapper,
          ]}
        >
          {button ??
            (selectedImage ? (
              <Image style={styles.image} source={{ uri: selectedImage }} />
            ) : (
              <Text style={commonStyles.titleText}>Add Image</Text>
            ))}
        </Pressable>
      </Row>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Row style={styles.searchRow}>
              <CustomInput
                onChangeText={setText}
                placeholder="Search here"
                fullFlex
                value={text}
              />
              <CustomButton
                onPress={getImages}
                title="Search"
                small
                rounded
                customStyle={{ width: 70 }}
              />
            </Row>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={themeColor.dark ?? theme.colors.primary}
                style={styles.loader}
              />
            ) : error ? (
              <Column justifyContent="center" alignItems="center">
                <Text style={[commonStyles.errorText]}>{error}</Text>
              </Column>
            ) : (
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={images}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setCurrentImage({ uri: item });
                      setIsVisible(true);
                    }}
                    style={[
                      styles.imageWrapper,
                      item === selectedImage && styles.selectedBorder,
                    ]}
                  >
                    <Image source={{ uri: item }} style={styles.image} />
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                numColumns={3}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Column justifyContent="center" alignItems="center">
                    <Text style={commonStyles.basicText}>No Image</Text>
                  </Column>
                }
              />
            )}

            <CustomButton
              title="Close"
              small
              rounded
              onPress={() => setShowModal(false)}
              error
            />
          </View>
        </View>
        <ImageView
          images={[currentImage]}
          imageIndex={0}
          visible={visible}
          onRequestClose={() => setIsVisible(false)}
          FooterComponent={
            onChange
              ? () => (
                  <Row style={{ margin: 16 }}>
                    <CustomButton title="Set" rounded onPress={onSelect} />
                  </Row>
                )
              : undefined
          }
        />
      </Modal>
    </>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  searchRow: {
    gap: 12,
    alignItems: "center",
  },
  listContent: {
    marginTop: 16,
    paddingBottom: 30,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedImageWrapper: {
    width: 180,
    height: 180,
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  loader: {
    marginTop: 20,
  },
});
