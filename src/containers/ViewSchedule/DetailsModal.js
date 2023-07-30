import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  VStack,
  ModalHeader,
} from "@chakra-ui/react";

import totalSksImg from "assets/Total-Sks.svg";
import jamMatkulImg from "assets/Jam-Matkul.svg";
import ruangKelasImg from "assets/Ruang-Kelas.svg";
import namaDosenImg from "assets/Dosen.svg";

const DetailsModal = ({
  isOpen,
  onClose,
  name,
  courseName,
  day,
  sks,
  start,
  end,
  room,
  lecturer,
}) => {
  const isMobile = useSelector((state) => state.appState.isMobile);
  const theme = useColorModeValue("light");

  return (
    <>
      {isMobile && (
        <Drawer
          isOpen={isOpen}
          onClose={onClose}
          placement="bottom"
          autoFocus={false}
        >
          <DrawerOverlay />
          <DrawerContent
            borderRadius="24px 24px 0px 0px"
            paddingX="28px"
            paddingY="48px"
            maxHeight={"fit-content"}
            top={"auto !important"}
          >
            <DrawerHeader
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={0}
              marginBottom="12px"
            >
              {String(name).includes(courseName) || !courseName ? (
                <Text fontWeight="semibold">{courseName}</Text>
              ) : (
                <Text fontWeight="semibold">
                  {courseName + " - "}
                  <Text
                    as="span"
                    fontWeight="bold"
                    color={theme === "light" ? "primary.Purple" : "dark.Purple"}
                  >
                    {name}
                  </Text>
                </Text>
              )}
              <DrawerCloseButton
                position="relative"
                top={0}
                right={0}
                width="20px"
                height="20px"
                marginLeft="4px"
                opacity={0.5}
              />
            </DrawerHeader>
            <hr color="#E4E4E7"></hr>
            <DrawerBody p={0} mt="32px">
              <VStack spacing="32px" align="start">
                <Container>
                  <img src={totalSksImg} alt="totalSks" />
                  <Content>
                    <p className="header">Total SKS</p>
                    <p className="desc">{sks}</p>
                  </Content>
                </Container>
                <Container>
                  <img src={jamMatkulImg} alt="Jam Matkul Image" />
                  <Content>
                    <p className="header">Jam Matkul</p>
                    <p className="desc">
                      {day + ", " + start + " - " + end + " WIB"}
                    </p>
                  </Content>
                </Container>
                <Container>
                  <img src={ruangKelasImg} alt="Ruang Kelas Image" />
                  <Content>
                    <p className="header">Ruang Kelas</p>
                    <p className="desc">{room}</p>
                  </Content>
                </Container>
                <Container>
                  <img src={namaDosenImg} alt="Nama Dosen Image" />
                  <Content>
                    <p className="header">Nama Dosen</p>
                    <p className="desc">{lecturer}</p>
                  </Content>
                </Container>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {!isMobile && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="24px" padding="48px">
            <ModalHeader
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={0}
              marginBottom="12px"
            >
              {String(name).includes(courseName) || !courseName ? (
                <Text fontWeight="semibold">{courseName}</Text>
              ) : (
                <Text fontWeight="semibold">
                  {courseName + " - "}
                  <Text
                    as="span"
                    fontWeight="bold"
                    color={theme === "light" ? "primary.Purple" : "dark.Purple"}
                  >
                    {name}
                  </Text>
                </Text>
              )}
              <ModalCloseButton
                position="relative"
                top={0}
                right={0}
                width="24px"
                height="24px"
                marginLeft="4px"
                opacity={0.5}
              ></ModalCloseButton>
            </ModalHeader>
            <hr color="#E4E4E7"></hr>
            <ModalBody p={0} mt="40px">
              <VStack spacing="32px" align="start">
                <Container>
                  <img src={totalSksImg} alt="totalSks" />
                  <Content>
                    <p className="header">Total SKS</p>
                    <p className="desc">{sks}</p>
                  </Content>
                </Container>
                <Container>
                  <img src={jamMatkulImg} alt="Jam Matkul Image" />
                  <Content>
                    <p className="header">Jam Matkul</p>
                    <p className="desc">
                      {day + ", " + start + " - " + end + " WIB"}
                    </p>
                  </Content>
                </Container>
                <Container>
                  <img src={ruangKelasImg} alt="Ruang Kelas Image" />
                  <Content>
                    <p className="header">Ruang Kelas</p>
                    <p className="desc">{room}</p>
                  </Content>
                </Container>
                <Container>
                  <img src={namaDosenImg} alt="Nama Dosen Image" />
                  <Content>
                    <p className="header">Nama Dosen</p>
                    <p className="desc">{lecturer}</p>
                  </Content>
                </Container>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 16px;
  .desc {
    font-weight: 600;
  }
  .header {
    font-size: 12px;
    color: #9ca3af;
  }
`;

export default DetailsModal;
