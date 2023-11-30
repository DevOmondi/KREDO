"use client";

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";

const UserSignup = () => {
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();

  const signUpHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // check if token verified to an email
    console.log("called: ", userEmail);
    if (userEmail) {
      axios
        .post(`${config.API_URL}/api/auth/self-register`, {
          email: userEmail,
          username: registerUsername,
          password: registerPassword,
          cPassword: confirmPassword,
        })
        .then((response) => {
          if (response) {
            if (response.data && response.data.errorMessage) {
              return alert(response.data.errorMessage);
            }
            if (response.data) alert(response.data.message);
            if (response.headers) storeToken(response.headers.authorization);
            navigate("/dashboard", { replace: true });
          }
        })
        .catch((error) => {
          // console.log(error);
          if (error.response.data) alert(error.response.data.errorMessage);
        });
    }
  };

  useEffect(() => {
    // get token from url params
    const queryString = window.location.search;
    const tkn = new URLSearchParams(queryString).get("validation");

    // confirm token validity
    axios
      .get(`${config.API_URL}/api/auth/self-register/`, {
        headers: { tkn },
      })
      .then((response) => {
        if (response) {
          if (response.data && response.data.errorMessage) {
            return alert(response.data.errorMessage);
          }
          setUserEmail(response.data.email);
          return setValidToken(true);
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.data) alert(error.response.data.errorMessage);
      });
  }, []);
  return (
    <div className="font-nunito">
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
            Let's get you signed up :)
          </Heading>
          <form onSubmit={signUpHandler}>
            <FormControl id="username" isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                placeholder="Username"
                _placeholder={{ color: "gray.500" }}
                type="text"
                focusBorderColor="primary.default"
                mb={"1rem"}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setRegisterUsername(event.target.value)
                }
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                placeholder="password"
                _placeholder={{ color: "gray.500" }}
                type="password"
                focusBorderColor="primary.default"
                mb={"1rem"}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setRegisterPassword(event.target.value)
                }
              />
            </FormControl>
            <FormControl id="confirm-password" isRequired>
              <FormLabel>Confirm password</FormLabel>
              <Input
                placeholder="Confirm password"
                _placeholder={{ color: "gray.500" }}
                type="password"
                focusBorderColor="primary.default"
                mb={"1rem"}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(event.target.value)
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
                Submit
              </Button>
            </Stack>
          </form>
        </Stack>
      </Flex>
    </div>
  );
};

export default UserSignup;
