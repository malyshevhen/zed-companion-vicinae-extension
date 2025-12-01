import { showToast, Toast } from "@vicinae/api/dist";

export const showFailureToast = (error: Error, options: Toast.Options) => {
  showToast({
    ...options,
    style: Toast.Style.Failure,
    title: error.message,
  });
};
