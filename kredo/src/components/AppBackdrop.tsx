import {
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";

export default function AppBackdrop() {
  const OverlayOne = () => (
    <ModalOverlay
      bg="whiteAlpha.300"
      backdropFilter="blur(10px) hue-rotate(10deg)"
    />
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [overlay, setOverlay] = useState(<OverlayOne />);

  //   TODO: Func to open Backdrop
  function openBackdrop() {
    setOverlay(<OverlayOne />);
    onOpen();
  }
  useEffect(() => {
    openBackdrop();
  }, []);
  return (
    <div className="font-nunito">
      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        {overlay}
        <ModalContent>
          <ModalBody>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="primary.default"
              size="xl"
              ml={"10em"}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
