import { useRef } from "react";
import { useDispatch } from "react-redux";

import { addProgressWithIdx } from "../redux/slices/uploadSlice.ts";

const UploadTest = () => {
  const dispatch = useDispatch();
  const ids = useRef<number[]>([]);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const startInterval = (id: number, progress: number, interval: number) => {
    timeouts.current.push(
      setInterval(() => {
        dispatch(addProgressWithIdx({ idx: id, progress: progress }));
      }, interval),
    );
    ids.current.push(id);
  };
  const killInterval = (id: number) => {
    clearInterval(timeouts.current[ids.current.findIndex((n) => n === id)]);
  };
  const killAllIntervals = () => {
    for (let i = 0; i < timeouts.current.length; i++) {
      clearInterval(timeouts.current[i]);
    }
  };
  return [startInterval, killInterval, killAllIntervals];
};

export default UploadTest;
