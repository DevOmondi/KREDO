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
import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";

export default function ChangePassword() {
  /* state management for keyed in data */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = (event: React.FormEvent<HTMLFormElement>) => {
    const authTkn = sessionStorage.getItem("tkn");
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    password: data.get("password");

    axios
      .post(
        // import config
        `${config.API_URL}/api/auth/password-update`,

        {
          // implement state and bind
          currentPassword: currentPassword,
          password: newPassword,
          cPassword: confirmPassword,
        },
        { Authorization: `Bearer ${authTkn}` }
      )
      .then((response) => {
        if (response) {
          if (response.data && response.data.errorMessage) {
            return alert(response.data.errorMessage);
          }
          if (response.data) alert(response.data.message);
          // declare navigate
          // navigate("/dashboard", { replace: true });
        }
      })
      .catch((error) => {
        if (error.response.data) alert(error.response.data.errorMessage);
      });
  };

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
          Let's get your password changed :)
        </Heading>
        <form onSubmit={changePassword}>
          <FormControl id="current-password" isRequired>
            <FormLabel>Current password</FormLabel>
            <Input
              placeholder="Current password"
              _placeholder={{ color: "gray.500" }}
              type="password"
              focusBorderColor="primary.default"
              mb={"1rem"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setCurrentPassword(event.target.value)
              }
            />
          </FormControl>
          <FormControl id="new-password" isRequired>
            <FormLabel>New password</FormLabel>
            <Input
              placeholder="New password"
              _placeholder={{ color: "gray.500" }}
              type="password"
              focusBorderColor="primary.default"
              mb={"1rem"}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setNewPassword(event.target.value)
              }
            />
          </FormControl>
          <FormControl id="confirm-password" isRequired>
            <FormLabel>Confirm password</FormLabel>
            <Input
              placeholder="Confirm new password"
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
}
