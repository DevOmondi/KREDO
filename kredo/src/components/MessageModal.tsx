import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  useDisclosure,
} from "@chakra-ui/react";

import { useEffect } from "react";

interface componentProps {
  message: string;
  close: ()=>void
}
export default function MessageModal(props: componentProps) {
  const { isOpen, onOpen, onClose} = useDisclosure();
  useEffect(()=> {
    onOpen()
  })
  return (
    <div className="font-nunito">
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Hey!</ModalHeader>
          <ModalBody>{props.message}</ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={props.close}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
