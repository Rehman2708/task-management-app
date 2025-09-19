import {
  View,
  Text,
  FlatList,
  Modal,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomInput from "./customInput";
import { Column, Row } from "../tools";
import { commonStyles } from "../styles/commonstyles";
import axios from "axios";
import CustomButton from "./customButton";

const ImageModal = ({
  onChange,
  defaultImage,
  disabled,
}: {
  onChange?: (uri: string) => void;
  defaultImage?: string;
  disabled?: boolean;
}) => {
  const [text, setText] = useState("cat");
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(defaultImage ?? "");

  const getImages = async () => {
    try {
      const res = await axios.get(
        `https://api.unsplash.com/search/photos?query=${text}&per_page=15&client_id=61NdYaS5S5HVnY7_fhiy2ryzbdOM0Mbyw83ltXUU2fg`
      );
      setImages(res.data.results.map((img: any) => img.urls.regular));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getImages();
  }, []);
  const onSelect = (url: string) => {
    setSelectedImage(url);
    if (onChange) {
      onChange(url);
    }
    setShowModal(false);
  };

  return (
    <>
      <Row justifyContent="center">
        <Pressable
          disabled={disabled}
          onPress={() => setShowModal(true)}
          style={[styles.imageWrapper, styles.selectedImageWrapper]}
        >
          {selectedImage ? (
            <Image style={[styles.image]} source={{ uri: selectedImage }} />
          ) : (
            <Text style={commonStyles.titleText}>Add Image</Text>
          )}
        </Pressable>
      </Row>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View
              style={{
                gap: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
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
            </View>

            <FlatList
              keyboardShouldPersistTaps="handled"
              data={images}
              renderItem={({ item }: { item: string }) => (
                <Pressable
                  onPress={() => onSelect(item)}
                  style={styles.imageWrapper}
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
                  <Text style={[commonStyles.basicText]}>No Image</Text>
                </Column>
              }
            />

            <CustomButton
              title="Close"
              small
              rounded
              onPress={() => setShowModal(false)}
              error
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // dark background
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
  listContent: {
    marginTop: 16,
    paddingBottom: 30,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  selectedImageWrapper: {
    width: 200,
    height: 200,
  },
  image: {
    height: "100%",
    width: "100%",
  },
});
