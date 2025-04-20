import { motion } from "motion/react";
import "./index.css";
import HomePage from "./pages/HomePage";
import github from "./assets/github-white.svg";

const App = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <HomePage />

      <motion.footer
        className="footer mt-auto items-center bg-gray-800 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "easeInOut" }}
      >
        <div className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
          <a
            href="https://github.com/pipe1os/OpenFiles"
            target="_blank"
            rel="noreferrer"
            className="link link-hover"
          >
            <img src={github} alt="GitHub" className="size-8" />
          </a>
          <p className="flex-grow px-4 text-center text-sm text-gray-500 sm:px-0">
            OpenFiles is an open source tool that allows you to convert your
            files to different formats.
          </p>
          <p className="flex items-center gap-x-1 text-center text-sm whitespace-nowrap text-gray-500 sm:text-right">
            Coded by{" "}
            <a
              href="https://github.com/pipe1os"
              target="_blank"
              rel="noreferrer"
              className="link link-hover"
            >
              <u>Felipe Arce</u>
            </a>
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default App;
