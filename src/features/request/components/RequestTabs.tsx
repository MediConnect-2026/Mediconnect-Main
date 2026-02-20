import React, { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { useTranslation } from "react-i18next";
import { ConnectionRequestCard } from "./Connectionrequestcard";

type Tab = "recibidas" | "enviadas";

interface ConnectionRequest {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  avatar: string;
}

interface RequestTabsProps {
  receivedRequests: ConnectionRequest[];
  sentRequests: ConnectionRequest[];
  onConnect: (id: string) => void;
  onReject: (id: string) => void;
  onWithdraw: (id: string) => void;
  setReceivedRequests: React.Dispatch<
    React.SetStateAction<ConnectionRequest[]>
  >;
  setSentRequests: React.Dispatch<React.SetStateAction<ConnectionRequest[]>>;
}

export const RequestTabs = ({
  receivedRequests,
  sentRequests,
  onConnect,
  onReject,
  onWithdraw,
}: RequestTabsProps) => {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState<Tab>("recibidas");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentList =
    activeTab === "recibidas" ? receivedRequests : sentRequests;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = currentList.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as Tab);
          setCurrentPage(1);
        }}
      >
        <TabsList variant="line" className="grid w-full grid-cols-2">
          <TabsTrigger value="recibidas" className="text-base">
            {t("requests.received")} ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="enviadas" className="text-base">
            {t("requests.sent")} ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="recibidas"
          className="space-y-4 min-h-[600px] w-full"
        >
          {paginatedList.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("requests.noReceivedTitle")}</EmptyTitle>
                <EmptyDescription>
                  {t("requests.noReceivedDescription")}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          ) : (
            <div className="space-y-0 divide-y divide-secondary/15 w-full">
              {paginatedList.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  type={activeTab}
                  onConnect={onConnect}
                  onReject={onReject}
                  onWithdraw={onWithdraw}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="enviadas"
          className="space-y-4 min-h-[600px] w-full"
        >
          {paginatedList.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("requests.noSentTitle")}</EmptyTitle>
                <EmptyDescription>
                  {t("requests.noSentDescription")}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          ) : (
            <div className="space-y-0 divide-y divide-secondary/15 w-full">
              {paginatedList.map((request) => (
                <ConnectionRequestCard
                  key={request.id}
                  request={request}
                  type={activeTab}
                  onConnect={onConnect}
                  onReject={onReject}
                  onWithdraw={onWithdraw}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
