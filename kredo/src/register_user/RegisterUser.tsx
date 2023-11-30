"use client";

import {
  Button,
  FormControl,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MessageModal from "../components/MessageModal";
import axios from "axios";
import config from "../config";

export default function RegisterUser() {
  const [userEmail, setUserEmail] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const registerUserHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios
      .post(`${config.API_URL}/api/auth/admin-register`, {
        email: userEmail,
      })
      .then((response) => {
        if (response) {
          if (response.data && response.data.errorMessage) {
            setModalTitle("Hey");
            setModalMessage(response.data.errorMessage);
            setShowModal(true);
          }
          if (response.data) {
            // alert(response.data.message);
            setModalTitle("Hey");
            setModalMessage(response.data.message);
            setShowModal(true);
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.data) {
          setModalTitle("Hey");
          setModalMessage(error.response.data.errorMessage);
          setShowModal(true);
        }
      });
  };
  // TODO: Func to close modal
  function closeModal() {
    setShowModal(false);
    navigate("/dashboard", { replace: true });
  }
  return (
    <div className="font-nunito">
      {showModal && (
        <MessageModal
          close={closeModal}
          title={modalTitle}
          message={modalMessage}
        />
      )}
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.700")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
          my={12}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
            Register new user
          </Heading>
          <Text
            fontSize={{ base: "sm", sm: "md" }}
            color={useColorModeValue("gray.800", "gray.400")}
          >
            New user will get an email with a register link
          </Text>
          <form onSubmit={registerUserHandler}>
            <FormControl id="email">
              <Input
                placeholder="user-email@example.com"
                _placeholder={{ color: "gray.500" }}
                focusBorderColor="primary.default"
                mb={"1rem"}
                type="email"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setUserEmail(event.target.value)
                }
              />
            </FormControl>
            <Stack spacing={6}>
              <Button
                bg={"primary.default"}
                color={"white"}
                _hover={{
                  bg: "primary.hover",
                }}
                type="submit"
              >
                Send
              </Button>
            </Stack>
          </form>
        </Stack>
      </Flex>
    </div>
  );
}
