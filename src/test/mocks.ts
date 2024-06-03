import { downloadFileSliceType } from "../redux/types.ts";

export const downFiles: downloadFileSliceType[] = [
  {
    file: {
      path: "12",
      name: "다운로드 완료된 놈.jpg",
    },
    isCompleted: true,
    isInProgress: false,
    progress: 100,
  },
  {
    file: {
      path: "12",
      name: "진행중.pdf",
    },
    isCompleted: false,
    isInProgress: true,
    progress: 70,
  },
  {
    file: {
      path: "12",
      name: "다운로드 안된 놈.png",
    },
    isCompleted: false,
    isInProgress: false,
    progress: 0,
  },
  {
    file: {
      path: "12",
      name: "엄청나게 진 제목의 파일인데 얼마나 길게 할지 모르겠을 정도로 긴 파일인데 이거 다운로드도 된 파일.zip",
    },
    isCompleted: false,
    isInProgress: true,
    progress: 40,
  },
];
