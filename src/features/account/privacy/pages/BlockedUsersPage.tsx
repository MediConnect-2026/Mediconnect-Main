import React, { useState } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { Avatar, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/shared/ui/pagination";
import { useTranslation } from "react-i18next";

type BadgeProps = {
  children: React.ReactNode;
  role: "PATIENT" | "DOCTOR" | "CENTER";
};

const Badge: React.FC<BadgeProps> = ({ children, role }) => (
  <span
    className={`px-4 py-1 rounded-full text-xs font-medium ${
      role === "PATIENT"
        ? "bg-blue-100 text-blue-800"
        : role === "DOCTOR"
          ? "bg-green-100 text-green-800"
          : "bg-purple-100 text-purple-800"
    }`}
  >
    {children}
  </span>
);

type UserRole = "PATIENT" | "DOCTOR" | "CENTER";

type BlockedUser = {
  id: number;
  name: string;
  userRole: UserRole;
  avatar: string;
};

const blockedUsers: BlockedUser[] = [
  {
    id: 1,
    name: "María González",
    userRole: "PATIENT",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 2,
    name: "Carlos Pérez",
    userRole: "DOCTOR",
    avatar: "",
  },
  {
    id: 3,
    name: "Hospital Dario Contreras",
    userRole: "CENTER",
    avatar: "",
  },
  {
    id: 4,
    name: "Hospital San Rafael",
    userRole: "CENTER",
    avatar: "",
  },
  {
    id: 5,
    name: "Ana Martínez",
    userRole: "PATIENT",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 6,
    name: "Dr. Juan López",
    userRole: "DOCTOR",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 7,
    name: "Clínica Universal",
    userRole: "CENTER",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 8,
    name: "Laura Fernández",
    userRole: "PATIENT",
    avatar: "",
  },
  {
    id: 9,
    name: "Centro Médico Dominicano",
    userRole: "CENTER",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 10,
    name: "Dr. Roberto Sánchez",
    userRole: "DOCTOR",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 11,
    name: "Hospital General",
    userRole: "CENTER",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 12,
    name: "Pedro Ramírez",
    userRole: "PATIENT",
    avatar: "",
  },
  {
    id: 13,
    name: "Clínica del Este",
    userRole: "CENTER",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 14,
    name: "Dra. Carmen Torres",
    userRole: "DOCTOR",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
  {
    id: 15,
    name: "José Méndez",
    userRole: "PATIENT",
    avatar: "",
  },
  {
    id: 16,
    name: "Hospital Metropolitano",
    userRole: "CENTER",
    avatar:
      "https://i.pinimg.com/736x/ad/4b/28/ad4b28ca4a909fca01201660c00c83f2.jpg",
  },
];

const USERS_PER_PAGE = 7;

// Helper para paginación con elipsis
const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);

  if (currentPage > 3) {
    pages.push("ellipsis-start");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis-end");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

function BlockedUsersPage() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(blockedUsers.length / USERS_PER_PAGE);
  const paginatedUsers = blockedUsers.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE,
  );

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-4xl"}>
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`${isMobile ? "text-3xl" : "text-5xl"} font-medium mb-2`}
          >
            {t("blockedUsers.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("blockedUsers.description")}
          </p>
        </div>
      </div>
      <hr className="border-t border-primary/15 w-full my-2" />

      <div
        className={`flex flex-col gap-6 ${isMobile ? "min-w-0" : "min-w-2xl"}`}
      >
        {paginatedUsers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {t("blockedUsers.noUsers")}
          </div>
        )}
        {paginatedUsers.map((user, index) => (
          <div
            key={`${user.id}-${index}`}
            className="flex flex-col sm:flex-row items-center justify-between border-b border-primary/15 py-6 gap-4"
          >
            <div className="flex items-center gap-6 flex-1 w-full">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                {user.avatar && user.avatar !== "null" ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-2xl border border-primary/5 transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded-2xl border border-primary/5">
                    <MCUserAvatar
                      name={user.name}
                      square
                      size={isMobile ? 64 : 80}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-lg font-medium truncate">
                    {user.name}
                  </span>
                  <Badge role={user.userRole}>
                    {user.userRole === "PATIENT"
                      ? t("blockedUsers.patient")
                      : user.userRole === "DOCTOR"
                        ? t("blockedUsers.doctor")
                        : t("blockedUsers.center")}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {t("blockedUsers.blocked")}
                </div>
              </div>
            </div>
            <MCButton
              size="sm"
              variant="outline"
              className="flex-shrink-0 w-full sm:w-auto"
            >
              {t("blockedUsers.unblockButton")}
            </MCButton>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={
                    page === 1
                      ? undefined
                      : () => setPage((p) => Math.max(1, p - 1))
                  }
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {pageNumbers.map((pageNum, idx) => {
                if (
                  pageNum === "ellipsis-start" ||
                  pageNum === "ellipsis-end"
                ) {
                  return (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={page === pageNum}
                      onClick={() => setPage(pageNum as number)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={
                    page === totalPages
                      ? undefined
                      : () => setPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </MCDashboardContent>
  );
}

export default BlockedUsersPage;
