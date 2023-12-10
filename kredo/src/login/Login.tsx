"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import AppBackdrop from "../components/AppBackdrop";
import MessageModal from "../components/MessageModal";

export default function Login() {
  // states management
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); //Instantiate navigate
  // TODO: Func to handle sign in
  const loginHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!userName || !passWord) {
      setModalMessage("Please fill in all the credentials :(");
      setShowModal(true);
    } else {
      setIsLoading(true);
      fetch(`${config.API_URL}/api/auth/login`, {
        method: "post",
        body: JSON.stringify({
          username: userName,
          password: passWord,
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then(async (_res) => ({
          response: _res,
          processed: await _res.json(),
        }))
        .then(({ response, processed }) => {
          if (response && processed) {
            if (processed?.errorMessage) {
              setModalMessage(processed?.errorMessage);
              setShowModal(true);
            }

            if (response.status === 200 && processed.message) {
              const jwtToken = response?.headers?.get("authorization");
              sessionStorage.setItem("tkn", jwtToken || "");
              setTimeout(function () {
                setIsLoading(false);
                navigate("/dashboard", { replace: true });
              }, 4000);
            } else {
              navigate("/", { replace: true });
              setTimeout(function () {
                console.log("Sorry!! couldn't log you in :(");
              }, 4000);
            }
          }
        })
        .catch((error) => {
          console.log("error: ", error);
          if (error?.response?.data)
            console.log(error?.response?.data?.errorMessage);
        });
    }
  };
  // TODO: Func to close modal
  function closeModal() {
    setShowModal(false);
    setIsLoading(false);
  }
  return (
    <div className="font-nunito">
      {showModal && <MessageModal message={modalMessage} close={closeModal} />}
      <Flex
        minH={"100vh"}
        align={"center"}
        justify={"center"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        {isLoading && <AppBackdrop />}
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
          <Stack align={"center"}>
            <Heading fontSize={"4xl"}>Welcome Admin</Heading>
            <Text fontSize={"lg"} color={"gray.600"}>
              <Text color={"blue.400"}></Text> ✌️
            </Text>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  focusBorderColor="primary.default"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setUserName(event.target.value)
                  }
                />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  focusBorderColor="primary.default"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setPassWord(event.target.value)
                  }
                />
              </FormControl>
              <Stack spacing={10}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Checkbox>Remember me</Checkbox>
                  <Text color={"blue.400"}>Forgot password?</Text>
                </Stack>
                <Button
                  bg={"primary.default"}
                  color={"white"}
                  _hover={{
                    bg: "primary.hover",
                  }}
                  onClick={loginHandler}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </div>
  );
}
