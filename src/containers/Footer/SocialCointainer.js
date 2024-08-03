import { Image, useColorModeValue } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ListIcon } from "./const";
import { StyledIconWrapper } from "./styles";

const SocialContainer = () => {
  const [listOfIcons, setListOfIcons] = useState([]);
  const theme = useColorModeValue("light", "dark");

  const importAll = (r) => {
    return r.keys().map(r);
  };

  useEffect(() => {
    let dir = [];

    if (theme === "light") {
      dir = importAll(require.context("assets/Beta/icons", false, /\.(svg)$/));
    } else {
      dir = importAll(require.context("assets/Beta/icons/icon-dark", false, /\.(svg)$/));
    }

    const list = dir.map((img, idx) => ({
      image: img.default,
      link: ListIcon[idx]?.url || "#",
    }));

    setListOfIcons(list);
  }, [theme]);

  return (
    <StyledIconWrapper>
      {listOfIcons.map((item, id) => (
        <a target="_blank" rel="noopener noreferrer" key={id} href={item.link}>
          <Image
            objectFit="contain"
            w="6"
            mx="5"
            src={item.image}
            alt={"image"}
          />
        </a>
      ))}
    </StyledIconWrapper>
  );
};

export default SocialContainer;
