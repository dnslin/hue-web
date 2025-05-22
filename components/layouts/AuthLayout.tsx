import React from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle = "欢迎使用兰空图床",
}) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
      >
        {/* Header */}
        <div className="p-6 sm:p-8">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          </div>

          {/* Content */}
          <div className="mt-6">{children}</div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-600">
          <p>Lsky Pro 图床 &copy; {new Date().getFullYear()}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
