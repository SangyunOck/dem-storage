export type setFileProgress = {
  id: number;
  progress: number;
};

export type uploadFileType = {
  path: string;
  name: string;
};

export type uploadFileSliceType = {
  path: string;
  name: string;
  id: number;
  startAt: Date;
  isCompleted: boolean;
  progress: number;
};

export type userType = {
  id: string;
  password: string;
};

export type userSliceType = {
  id: string | null;
  password: string | null;
  isAuthenticated: boolean;
};
