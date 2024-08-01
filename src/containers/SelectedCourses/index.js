import React from "react";
import ReactGA from "react-ga";
import styled from "styled-components";
// import { useMixpanel } from "hooks/useMixpanel";
import { withRouter } from "react-router";

import { useSelector, useDispatch } from "react-redux";

import {
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";

import { removeSchedule, clearSchedule } from "redux/modules/schedules";
import { setLoading } from "redux/modules/appState";
import { putUpdateSchedule } from "services/api";
import { postSaveSchedule } from "services/api";
import { deleteSchedule } from "services/api";
import { makeAtLeastMs } from "utils/promise";

import { isScheduleConflict, listScheduleConflicts } from "./utils";

import TrashIcon from "assets/Trash.svg";
import { RistekAds } from "@ristek-kit/ads";

function transformSchedules(schedules) {
  return schedules
    .map((schedule) =>
      schedule.schedule_items.map((item) => ({
        ...item,
        name: schedule.name,
        course_name: schedule.parentName,
        sks: schedule.credit,
        lecturer: schedule.lecturer,
      })),
    )
    .reduce((prev, now) => [...prev, ...now], []);
}

function SelectedCourses({ history, scheduleId, isEditing }) {
  const schedules = useSelector((state) => state.schedules);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const theme = useColorModeValue("light", "dark");
  const totalCredits = schedules.reduce((prev, { credit }) => prev + credit, 0);

  async function saveSchedule() {
    dispatch(setLoading(true));
    try {
      const {
        data: { id: scheduleId },
      } = await postSaveSchedule(auth.userId, transformSchedules(schedules));
      dispatch(clearSchedule());
      ReactGA.event({
        category: "Simpan Jadwal",
        action: "Created/edited a schedule",
      });
      history.push({
        pathname: `/jadwal/${scheduleId}`,
        state: { feedbackPopup: true }
      });
    } catch (e) {
      /** TODO: handle error */
    }
    setTimeout(() => dispatch(setLoading(false)), 1000);
  }

  async function updateSchedule() {
    dispatch(setLoading(true));
    try {
      const { data } = await makeAtLeastMs(
        putUpdateSchedule(
          auth.userId,
          scheduleId,
          transformSchedules(schedules),
        ),
        1000,
      );
      dispatch(clearSchedule());
      history.push({
        pathname: `/jadwal/${data.user_schedule.id}`,
        state: { feedbackPopup: true }
      });
    } catch (e) {
      /** TODO: handle error */
    }
    setTimeout(() => dispatch(setLoading(false)), 1000);
  }

  const handleDeleteSchedule = async () => {
    dispatch(setLoading(true));
    await makeAtLeastMs(deleteSchedule(auth.userId, scheduleId), 1000);
    dispatch(clearSchedule());
    history.push("/jadwal");
    setTimeout(() => dispatch(setLoading(false)), 1000);
  };

  let isConflict = false;

  const items = schedules.map((schedule, idx) => {
    const isCurrentScheduleConflict = isScheduleConflict(schedules, schedule);
    isConflict = isConflict || isCurrentScheduleConflict;

    const labelName = String(schedule.name).includes(schedule.parentName)
      ? schedule.name
      : `${schedule.parentName} - ${schedule.name}`;

    const classesTimes = schedule.schedule_items.map((item, index) => (
      <li key={index}>
        {item.day}, {item.start}-{item.end}
      </li>
    ));

    return (
      <TableContentRow
        key={idx}
        inverted={isCurrentScheduleConflict}
        mode={theme}
      >
        <div className="courseName">{labelName}</div>
        <div>
          <ul>{classesTimes}</ul>
        </div>
        <div className="small-2 columns">
          <span>{schedule.credit}</span>
        </div>
        <div className="small-1 columns text-right">
          <DeleteButton
            inverted={isCurrentScheduleConflict}
            onClick={() => dispatch(removeSchedule(schedule))}
          />
        </div>
      </TableContentRow>
    );
  });

  const listConflicts = listScheduleConflicts(schedules);
  const conflicts = listConflicts.map((conflict, idx) => {
    return (
      <li>
        {conflict[0]} dengan {conflict[1]}
      </li>
    );
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={theme === "light" ? "white" : "dark.LightBlack"}>
          <ModalBody>Apakah kamu yakin ingin menyimpan jadwal?</ModalBody>

          <ModalFooter>
            <Button
              onClick={() => {
                onClose();
                // useMixpanel.track("cancel");
              }}
              variant="outline"
              borderColor={
                theme === "light" ? "primary.Purple" : "dark.LightPurple"
              }
              color={theme === "light" ? "primary.Purple" : "dark.Purple"}
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                !isEditing
                  ? saveSchedule()
                  : schedules.length === 0
                  ? handleDeleteSchedule()
                  : updateSchedule();

                // useMixpanel.track("simpan_jadwal");
              }}
              variant="solid"
              bg={theme === "light" ? "primary.Purple" : "dark.LightPurple"}
              color={theme === "light" ? "white" : "dark.White"}
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div style={{ marginBottom: 24 }}>
        <RistekAds />
      </div>

      <Container mode={theme}>
        <h3>Kelas Pilihan</h3>

        <TableHeader mode={theme}>
          <div>Kelas</div>
          <div>Waktu</div>
          <div>
            <span>SKS</span>
          </div>
        </TableHeader>

        {items}

        <TableCreditSum>
          <div>
            <span style={{ color: theme === "light" ? "#FFFFFF" : "#D0D0D0" }}>
              Total SKS
            </span>
          </div>
          <div>
            <span>{totalCredits}</span>
          </div>
        </TableCreditSum>

        {isConflict && (
          <MessageContainer>
            <p>Ada jadwal yang bertabrakan:</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "10px 20px",
              }}
            >
              <ul style={{ textAlign: "left" }}>{conflicts}</ul>
            </div>
          </MessageContainer>
        )}

        {!isConflict && totalCredits > 24 && (
          <MessageContainer>
            <p>Jumlah SKS yang diambil melebihi batas maksimum (24 SKS).</p>
          </MessageContainer>
        )}

        <Button
          onClick={() => {
            // useMixpanel.track("open_simpan_modal");
            onOpen();
          }}
          disabled={isConflict || totalCredits > 24 || schedules.length === 0}
          intent={schedules.length === 0 && isEditing && "danger"}
        >
          Simpan Jadwal
        </Button>

        {isConflict && (
          <MessageContainer>
            <p>Perbaiki jadwal terlebih dahulu sebelum menyimpan</p>
          </MessageContainer>
        )}
      </Container>
    </>
  );
}

export default withRouter(SelectedCourses);

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

const Container = styled.div`
  width: 100%;
  color: #333333;
  h3 {
    color: ${({ mode }) =>
      mode === "light"
        ? (props) => props.theme.color.primaryPurple
        : (props) => props.theme.color.darkPurple};
    margin-bottom: 16px;
    text-align: center;
    font-weight: bold;
    font-size: 24px;
  }

  > button {
    margin-top: 16px;
    width: 100%;
    background-color: ${({ mode }) =>
      mode === "light"
        ? (props) => props.theme.color.primaryPurple
        : (props) => props.theme.color.darkLightPurple};
    color: ${({ mode }) =>
      mode === "light" ? "#FFFFFF" : (props) => props.theme.color.darkWhite};
  }

  button:disabled,
  button[disabled] {
    background: #bdbdbd;
    opacity: 100%;
    color: #ffffff;
  }

  button:disabled:hover,
  button[disabled]:hover {
    background: rgba(189, 189, 189, 0.8);
  }

  padding-bottom: 32px;
`;

const TableHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #bdbdbd;
  align-items: center;
  font-weight: 600;
  color: ${({ mode }) =>
    mode === "light"
      ? (props) => props.theme.color.secondaryMineshaft
      : (props) => props.theme.color.darkWhite};
  div {
    padding: 0.5rem 0;
    &:nth-child(1) {
      flex: 4;
      margin-left: 1rem;
    }
    &:nth-child(2) {
      flex: 5;
    }
    &:nth-child(3) {
      flex: 3;
    }
  }
`;

const TableContentRow = styled.div`
  :nth-child(odd) {
    background: ${({ inverted }) =>
      inverted
        ? ({ mode }) =>
            mode === "light"
              ? "rgba(235, 87, 87, 0.2)"
              : (props) => props.theme.color.darkRed
        : ({ mode }) =>
            mode === "light"
              ? (props) => props.theme.color.primaryWhite
              : (props) => props.theme.color.darkBlack};
  }
  :nth-child(even) {
    background: ${({ inverted }) =>
      inverted
        ? ({ mode }) =>
            mode === "light"
              ? "rgba(235, 87, 87, 0.2)"
              : (props) => props.theme.color.darkRed
        : ({ mode }) =>
            mode === "light"
              ? "#F5F5F5"
              : (props) => props.theme.color.darkBlack};
  }

  display: flex;
  min-height: 70px;
  font-size: 0.75rem;

  color: ${({ mode }) =>
    mode === "light"
      ? (props) => props.theme.color.secondaryMineshaft
      : (props) => props.theme.color.primaryWhite};
  div {
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;

    ul {
      margin-left: 15%;
      text-align: left;
    }

    li {
      list-style-type: none;
      position: relative;
    }

    li::before {
      content: "•";
      position: absolute;
      left: -12px;
      font-size: 16px;
    }

    &:nth-child(1) {
      flex: 4;
      margin-left: 1rem;
    }
    &:nth-child(2) {
      flex: 5;
    }
    &:nth-child(3) {
      flex: 2;
      font-size: 16px;

      span {
        margin-left: 18px;
      }
    }
    &:nth-child(4) {
      flex: 1;
      margin-right: 6px;
    }
  }
`;

const TableCreditSum = styled.div`
  background-color: #333333;
  border-radius: 4px;
  font-weight: bold;
  font-size: 16px;
  color: white;

  padding: 4px 12px;
  margin-top: 8px;
  display: flex;

  div {
    &:nth-child(1) {
      flex: 9;
      display: flex;
      justify-content: flex-end;
      margin-right: 20%;
    }
    &:nth-child(2) {
      span {
        margin-left: 12px;
      }
      flex: 3;
    }
  }
`;

const DeleteButton = styled.button`
  background: url(${TrashIcon});
  background-size: contain;
  background-repeat: no-repeat;
  height: 100%;
  width: 80%;
  align-self: center;
`;

const MessageContainer = styled.div`
  margin: 16px -5px 0px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: #e91515;

  @media (min-width: 900px) {
    margin: 18px -5px 0px;
    font-size: 14px;
  }
`;
