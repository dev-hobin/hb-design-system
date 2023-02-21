import { useEffect, useState } from "react";

export const Empty = () => {
  const [a, setA] = useState<boolean>(false);
  useEffect(() => {}, []);
  return null;
};
