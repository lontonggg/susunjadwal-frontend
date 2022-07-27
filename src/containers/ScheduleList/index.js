import React, { useEffect, useState } from "react";
import ReactGA from "react-ga";
import { useHistory } from "react-router";
import {
  Button,
  Box,
  Modal,
  ModalOverlay,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalBody,
  useDisclosure,
  ModalCloseButton,
  Flex,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { getSchedules } from "services/api";
import { setLoading } from "redux/modules/appState";
import { makeAtLeastMs } from "utils/promise";
import Schedule from "containers/ViewSchedule/Schedule";
import { decodeHtmlEntity } from 'utils/string';
import { BauhausSide } from 'components/Bauhaus';
import BauhausMobile from "assets/Beta/bauhaus-sm.svg";
import BauhausDesktop from "assets/Beta/bauhaus-lg.svg";
import BauhausDarkDesktop from "assets/Beta/bauhaus-dark-lg.svg";
import ScheduleDetail from "./ScheduleDetail";
import { deleteSchedule } from "services/api";
import { SuccessToast, ErrorToast } from "components/Toast";
import CopyToClipboard from "react-copy-to-clipboard";
import alertImg from "assets/Alert2.svg";
import linkImg from "assets/Link.svg";
import copyImg from "assets/Copy.svg";
import alertDarkImg from "assets/Alert-dark.svg";
import linkDarkImg from "assets/Link-dark.svg";
import copyDarkImg from "assets/Copy-dark.svg";
import { copyImageToClipboard } from "copy-image-clipboard";

const ScheduleList = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const auth = useSelector((state) => state.auth);
  const isMobile = useSelector((state) => state.appState.isMobile);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const shareModal = useDisclosure();
  const theme = useColorModeValue("light", "dark");
  const [selectedId, setSelectedId] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [schedules, setSchedules] = useState();
  const [imageURL, setImageURL] = useState("");

  const { generateICalendarFile } = useDownloadCalendar();

  useEffect(() => {
    const fetchSchedules = async () => {
      dispatch(setLoading(true));
      const {
        data: { user_schedules },
      } = await makeAtLeastMs(getSchedules(auth.userId), 1000);
      setSchedules(user_schedules);
      dispatch(setLoading(false));
    };

    fetchSchedules();
  }, [dispatch, auth]);

  const performDeleteSchedule = async (userId, scheduleId) => {
    ReactGA.event({
      category: "Hapus Jadwal",
      action: "Deleted a schedule",
    });
    dispatch(setLoading(true));
    onClose();
    await makeAtLeastMs(deleteSchedule(userId, scheduleId), 1000);
    const {
      data: { user_schedules },
    } = await makeAtLeastMs(getSchedules(auth.userId), 1000);
    setSchedules(user_schedules);
    dispatch(setLoading(false));
  };

  const confirmDeleteSchedule = (scheduleId) => {
    performDeleteSchedule(auth.userId, scheduleId);
  };

  const showDialogDelete = (id) => {
    setSelectedId(id);
    onOpen();
  };

  const showAlertCopy = (type) => {
    ReactGA.event({
      category: "Bagikan Jadwal",
      action: "Copied a schedule's URL",
    });
    SuccessToast(`${type} berhasil disalin!`, isMobile, theme);
  };

  const showErrorCopy = () => {
    ReactGA.event({
      category: "Bagikan Jadwal",
      action: "Copied a schedule's image",
    });
    ErrorToast(
      "Uh oh, terjadi kesalahan. Coba ganti browser atau device yang Anda gunakan.",
      isMobile,
      theme,
    );
  };

  const handleClickEditJadwal = (idJadwal) => {
    history.push(`/edit/${idJadwal}`);
  };

  const showDialogShare = (id, name, dataUrl) => {
    setSelectedId(id);
    setSelectedName(name);
    setImageURL(dataUrl);
    shareModal.onOpen();
  };

  const copyImage = () => {
    copyImageToClipboard(imageURL)
      .then(() => showAlertCopy("Gambar"))
      .catch((e) => showErrorCopy());
  };

  return (
    <Container>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={theme === "light" ? "white" : "dark.LightBlack"}>
          <ModalBody>Apakah kamu yakin ingin menghapus jadwal?</ModalBody>

          <ModalFooter>
            <Button
              onClick={onClose}
              variant="outline"
              borderColor={
                theme === "light" ? "primary.Purple" : "dark.LightPurple"
              }
              color={theme === "light" ? "primary.Purple" : "dark.Purple"}
            >
              Batal
            </Button>
            <Button
              onClick={() => confirmDeleteSchedule(selectedId)}
              variant="danger"
              bg={theme === "light" ? "primary.Purple" : "dark.LightPurple"}
              color={theme === "light" ? "white" : "dark.White"}
            >
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={shareModal.isOpen} onClose={shareModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={theme === "light" ? "white" : "dark.LightBlack"}>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDirection="column">
              <Text mb="8px">
                Bagikan Jadwal <b>{selectedName}</b>
              </Text>
              <Image alt="" src={imageURL} maxH="30vh" objectFit="contain" />
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Flex flexDirection="column">
              <Flex flexDirection={isMobile ? "column" : "row"}>
                <CopyToClipboard
                  text={`${window.location.href}/${selectedId}`}
                  onCopy={() => showAlertCopy("Link")}
                >
                  <Button
                    variant="outline"
                    borderColor={
                      theme === "light" ? "primary.Purple" : "dark.LightPurple"
                    }
                    color={theme === "light" ? "primary.Purple" : "dark.Purple"}
                    mb={isMobile ? "8px !important" : "0"}
                  >
                    <img
                      src={theme === "light" ? linkImg : linkDarkImg}
                      style={{ marginRight: "4px" }}
                      alt=""
                    />
                    Copy Link
                  </Button>
                </CopyToClipboard>
                <Button
                  variant="solid"
                  onClick={copyImage}
                  bg={theme === "light" ? "primary.Purple" : "dark.LightPurple"}
                  color={theme === "light" ? "white" : "dark.White"}
                >
                  <img
                    src={theme === "light" ? copyImg : copyDarkImg}
                    style={{ marginRight: "8px" }}
                    alt=""
                  />
                  Copy Image
                </Button>
              </Flex>
              <Flex mt="1rem">
                <img
                  src={theme === "light" ? alertImg : alertDarkImg}
                  style={{ height: "24px" }}
                  alt=""
                />
                <Text fontSize={isMobile && "12px"}>
                  <b>Copy Image</b> akan menyalin gambar ke clipboard sementara{" "}
                  <b>Copy Link</b> akan menyalin link jadwal
                </Text>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Helmet
        title="Daftar Jadwal"
        meta={[{ name: "description", content: "Description of Jadwal" }]}
      />

      {!!schedules?.length && (
        <>
          <BauhausSide />
          <PageTitle mobile={isMobile} mode={theme}>
            Daftar Jadwal
          </PageTitle>
        </>
      )}

      {!!schedules?.length ? (
        <CardContainer>
          {schedules?.map((schedule, idx) => {
            return (
              <ScheduleDetail
                schedule={schedule}
                idx={idx}
                key={schedule.id}
                showModal={showDialogDelete}
                editSchedule={handleClickEditJadwal}
                showShareModal={showDialogShare}
              />
            );
          })}
        </CardContainer>
      ) : (
        <>
          {isMobile ? (
            <AssetBauhaus
              isMobile={isMobile}
              src={BauhausMobile}
              alt="bauhaus-sm"
            />
          ) : (
            <AssetBauhaus
              src={theme === "light" ? BauhausDesktop : BauhausDarkDesktop}
              alt="bauhaus-lg"
            />
          )}
          <Box pt="90px" mb={{ base: 16, md: "160px" }}>
            <div
              style={{ textAlign: isMobile ? "center" : "left", width: "100%" }}
            >
              <PageTitleNoSchedule mobile={isMobile} mode={theme}>
                Daftar Jadwal
              </PageTitleNoSchedule>
              <PageInfo mobile={isMobile} mode={theme}>
                Anda belum pernah membuat jadwal. Mulai susun jadwal anda
                sekarang!
              </PageInfo>
              <Link to={`/susun`}>
                <Button
                  height={{ base: "44px", md: "57px" }}
                  width={{ base: "137px", md: "194px" }}
                  ml={{ md: 12 }}
                  fontSize={{ base: "14px", md: "18px" }}
                  bg={theme === "light" ? "primary.Purple" : "dark.LightPurple"}
                  color={theme === "light" ? "white" : "dark.White"}
                >
                  Buat Jadwal
                </Button>
              </Link>
            </div>
          </Box>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  margin-left: -3rem;
  margin-right: -3rem;
`;

const PageTitle = styled.h1`
  margin: ${({ mobile }) => (mobile ? "-40px 0 0 0px" : "0px 48px 30px 48px")};
  font-size: ${({ mobile }) => (mobile ? "1.7rem" : "2rem")};
  text-align: center;
  font-weight: bold;
  color: ${({ mode }) => (mode === "light" ? "#5038bc" : "#917DEC")};
  @media (min-width: 900px) {
    text-align: left;
  }
`;

const PageTitleNoSchedule = styled.h1`
  font-size: ${({ mobile }) => (mobile ? "50px" : "64px")};
  font-weight: bold;
  color: ${({ mode }) => (mode === "light" ? "#5038bc" : "#917DEC")};
  margin: ${({ mobile }) => (mobile ? "2rem" : "32px 48px 16px 48px")};
`;

const PageInfo = styled.h2`
  font-size: ${({ mobile }) => (mobile ? "14px" : "18px")};
  margin: ${({ mobile }) => (mobile ? "2rem" : "32px 48px 48px 48px")};
  color: ${({ mode }) => (mode === "light" ? "#333333" : "#D0D0D0")};
`;

const CardContainer = styled.div`
  padding: ${(props) => (props.theme.mobile ? "1rem 3rem 0 3rem" : "0 48px")};
  width: 100%;
`;

const AssetBauhaus = styled.img`
  position: absolute;
  right: 0;
  top: 0;
  ${(props) =>
    props.isMobile &&
    `
    top: 50px;
    width: 100%;
    display: block;
    @media (min-width: 540px) {
      display: none;
    }
  `}
`;
const ModalContent = styled(ChakraModalContent).attrs({
  padding: { base: "16px 24px", lg: "20px 24px" },
  width: { base: "90%", lg: "initial" },
  textAlign: "center",
})``;

const ModalFooter = styled(ChakraModalFooter).attrs({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: { base: "12px", lg: "16px" },
})`
  button {
    margin: 0px 4px;
  }
`;
export default ScheduleList;
