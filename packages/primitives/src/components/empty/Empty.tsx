import { useEffect, useState } from "react";

export const Empty = () => {
  const [a, setA] = useState<boolean>(false);
  useEffect(() => {
    console.log(setA);
    if (a) {
      console.log("ho");
    }
  }, []);
  return null;
};
