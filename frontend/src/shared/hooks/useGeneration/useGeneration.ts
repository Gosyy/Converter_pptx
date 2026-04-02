// import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "../../../app/store";
// import { testMarkdown } from "../../constants/testMarkdown";
// import { markdownToSlides } from "../../utils/markdownToSlides";
// import { setSlides } from "../../../app/store/slices/editorSlice";
// import {
//   setLoading,
//   setPromptSettings,
// } from "../../../app/store/slices/promptSlice";

// const API_URL = process.env.REACT_APP_API_URL;

// interface ChatMessage {
//   id: string;
//   type: "user" | "ai";
//   content: string;
//   file?: File | null;
// }
// export const useGeneration = () => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [inputText, setInputText] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const dispatch = useDispatch<AppDispatch>();
//   const [model, setModel] = useState<string>("GigaChat-2-Pro");
//   const [fileStatus, setFileStatus] = useState<{
//     name: string;
//     converted: boolean;
//   } | null>(null);

//   const { file, text, loading } = useSelector(
//     (state: RootState) => state.prompt
//   );

//   useEffect(() => {
//     const mockMessages: ChatMessage[] = [
//       {
//         id: crypto.randomUUID(),
//         type: "ai",
//         content: "Привет! Я помогу тебе пересоздать презентацию.",
//       },
//     ];
//     setMessages(mockMessages);
//   }, []);

//   const sendMessage = (): Promise<boolean> => {
//     return new Promise((resolve) => {
//       if ((!inputText.trim() || !selectedFile) && (!file || !text.trim())) {
//         setError("Введите текст и прикрепите файл!");
//         resolve(false);
//         return;
//       }

//       const userMsg: ChatMessage = {
//         id: crypto.randomUUID(),
//         type: "user",
//         content: inputText,
//         file: selectedFile || file,
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       dispatch(setPromptSettings({ text: inputText, file: selectedFile }));
//       setInputText("");
//       setFileStatus({
//         name: selectedFile?.name || file?.name || "unknown",
//         converted: false,
//       });
//       dispatch(setLoading(true));

//       setTimeout(() => {
//         const aiMsg: ChatMessage = {
//           id: crypto.randomUUID(),
//           type: "ai",
//           content: "Конечно! Вот сгенерированная презентация.",
//         };
//         setMessages((prev) => [...prev, aiMsg]);
//         setFileStatus({
//           name: selectedFile?.name || file?.name || "unknown",
//           converted: true,
//         });
//         setSelectedFile(null);
//         const parsedSlides = markdownToSlides(testMarkdown);
//         dispatch(setSlides(parsedSlides));
//         if (fileInputRef.current) fileInputRef.current.value = "";
//         resolve(true);
//         dispatch(setLoading(false));
//       }, 500);
//     });
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setSelectedFile(file);
//     setFileStatus({ name: file.name, converted: true });
//   };
//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     return await sendMessage();
//   };

//   const regenerateSlides = async () => {
//     return await sendMessage();
//   };

//   return {
//     inputText,
//     setInputText,
//     messages,
//     fileInputRef,
//     fileStatus,
//     handleFileChange,
//     handleSubmit,
//     loading,
//     error,
//     setError,
//     model,
//     setModel,
//     regenerateSlides,
//   };
// };

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { markdownToSlides } from "../../utils/markdownToSlides";
import { setSlides } from "../../../app/store/slices/editorSlice";
import { PlateSlide } from "../../types";
import {
  setLoading,
  setGenerating,
} from "../../../app/store/slices/promptSlice";
import { getContext } from "../../../entities";
import { nanoid } from "@reduxjs/toolkit";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  file?: File | null;
}

export const useGeneration = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string>("GigaChat-2-Pro");
  const dispatch = useDispatch<AppDispatch>();

  const wsRef = useRef<WebSocket | null>(null);

  const { file, text, loading } = useSelector(
    (state: RootState) => state.prompt
  );

  const [fileStatus, setFileStatus] = useState<{
    name: string;
    converted: boolean;
  } | null>(null);
  const [progressEvents, setProgressEvents] = useState<string[]>([]);

  useEffect(() => {
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      type: "ai",
      content: "Привет! Я помогу тебе создать презентацию по файлу.",
    };
    setMessages([aiMsg]);
  }, []);

  const sendMessageWS = async () => {
    if (!inputText.trim() || !selectedFile) {
      setError("Введите текст и прикрепите файл!");
      return false;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      content: inputText,
      file: selectedFile,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setFileStatus({ name: selectedFile?.name || "unknown", converted: false });

    try {
      dispatch(setGenerating(true));
      dispatch(setLoading(true));

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        type: "ai",
        content: "",
      };
      setMessages((prev) => [...prev, aiMsg]);

      let fullText = "";
      let allSlides: PlateSlide[] = [];
      let firstChunkReceived = false;
      let updateScheduled = false;
      setProgressEvents([]);

      const clientId = crypto.randomUUID();
      const wsUrl = process.env.REACT_APP_API_URL
        ?.replace(/^http/, "ws")
        .replace(/\/api$/, `/api/presentation/progress/ws/${clientId}`);
      const progressWs = wsUrl ? new WebSocket(wsUrl) : null;
      progressWs?.addEventListener("message", (event) => {
        try {
          const payload = JSON.parse(event.data);
          setProgressEvents((prev) => [...prev, `${payload.stage}: ${payload.status}`]);
        } catch {
          // no-op
        }
      });

      await getContext(
        selectedFile!,
        model,
        userMsg.content,
        clientId,
        (chunk) => {
          fullText += chunk;

          if (!firstChunkReceived) {
            firstChunkReceived = true;
            dispatch(setLoading(false));
          }

          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, content: fullText } : m))
          );

          const parts = fullText.split(/^#\s+/gm).filter((p) => p.trim() !== "");

          const layouts: PlateSlide["layout"][] = [
            "left-image",
            "right-image",
            "bottom-image",
            "top-image",
          ];

          let layoutIndex = 0;

          parts.forEach((part, index) => {
            const slideText = "# " + part;
            const titleMatch = slideText.match(/^#\s*(.+)/);
            const title = titleMatch ? titleMatch[1] : "Slide";

            const parsedSlides = markdownToSlides(slideText);
            const parsed = parsedSlides[0] || {
              content: [],
              layout: "text-only",
            };

            const hasImage = parsed.content.some((b) => b.type === "image");
            const layout = hasImage
              ? layouts[layoutIndex % layouts.length]
              : "text-only";

            if (!allSlides[index]) {
              allSlides[index] = {
                id: nanoid(),
                title,
                markdownText: slideText,
                content: parsed.content,
                layout,
              };
            } else {
              allSlides[index] = {
                ...allSlides[index],
                markdownText: slideText,
                content: parsed.content,
                layout,
              };
            }

            if (hasImage) layoutIndex++;
          });

          if (!updateScheduled) {
            updateScheduled = true;
            setTimeout(() => {
              dispatch(setSlides([...allSlides]));
              updateScheduled = false;
            }, 300);
          }
        }
      );
      progressWs?.close();

      setFileStatus({ name: selectedFile.name, converted: true });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      return true;
    } catch (err) {
      console.error(err);
      dispatch(setLoading(false));
      setError("Ошибка генерации");
      setFileStatus(null);
      return false;
    } finally {
      dispatch(setGenerating(false));
    }
  };

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileStatus({ name: file.name, converted: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    return sendMessageWS();
  };

  const regenerateSlides = async () => {
    return sendMessageWS();
  };

  return {
    inputText,
    setInputText,
    messages,
    fileInputRef,
    fileStatus,
    handleFileChange,
    handleSubmit,
    loading,
    error,
    setError,
    model,
    setModel,
    regenerateSlides,
    progressEvents,
  };
};
