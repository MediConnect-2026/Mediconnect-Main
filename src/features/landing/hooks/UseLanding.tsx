import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import apiClient, { type ApiErrorResponse } from "@/services/api/client";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type NewsletterFormValues = {
  email: string;
};

export function useLanding() {
  const { t } = useTranslation("landing");
  const setToast = useGlobalUIStore((s) => s.setToast as any);

  const contactMutation = useMutation<
    { success: boolean; message: string },
    AxiosError<ApiErrorResponse>,
    ContactFormValues
  >({
    mutationFn: async (values) => {
      const { data } = await apiClient.post("/contacto/enviar", {
        nombre: values.name,
        correo: values.email,
        asunto: values.subject,
        mensaje: values.message,
      });
      return data;
    },
    onSuccess: (data) => {
      setToast?.({
        type: "success",
        open: true,
        message: data?.message || t("contacts.toasts.contactSuccess"),
      });
    },
    onError: (error) => {
      setToast?.({
        type: "error",
        open: true,
        message:
          error.response?.data?.message || t("contacts.toasts.contactError"),
      });
    },
  });

  const newsletterMutation = useMutation<
    { success?: boolean; message?: string },
    AxiosError<ApiErrorResponse>,
    NewsletterFormValues
  >({
    mutationFn: async (values) => {
      const { data } = await apiClient.post("/contacto/newsletter", {
        correo: values.email,
      });
      return data;
    },
    onSuccess: (data) => {
      setToast?.({
        type: "success",
        open: true,
        message: data?.message || t("contacts.toasts.newsletterSuccess"),
      });
    },
    onError: (error) => {
      setToast?.({
        type: "error",
        open: true,
        message:
          error.response?.data?.message || t("contacts.toasts.newsletterError"),
      });
    },
  });

  return {
    sendContact: contactMutation.mutateAsync,
    sendNewsletter: newsletterMutation.mutateAsync,
    isSendingContact: contactMutation.isPending,
    isSendingNewsletter: newsletterMutation.isPending,
  };
}
