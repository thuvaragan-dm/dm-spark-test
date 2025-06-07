import { useState } from "react";

const useGetPreviousState = (state: any) => {
  const [stateHolder, setStateHolder] = useState([null, state]);

  if (stateHolder[1] !== state) {
    setStateHolder([stateHolder[1], state]);
  }

  //[0] has the previous state value
  return stateHolder[0];
};

export default useGetPreviousState;
