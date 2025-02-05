"use client";

import styles from "./pagination.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({ count }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const page = searchParams.get("page") || 1;
  const currentPage = parseInt(page);

  const params = new URLSearchParams(searchParams);
  const ITEM_PER_PAGE = 2;

  const hasPrev = ITEM_PER_PAGE * (currentPage - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (currentPage - 1) + ITEM_PER_PAGE < count;

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  const handleChangePage = (type) => {
    type === "prev"
      ? params.set("page", currentPage - 1)
      : params.set("page", currentPage + 1);
    replace(`${pathname}?${params}`);
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        disabled={!hasPrev}
        onClick={() => handleChangePage("prev")}
      >
        Previous
      </button>
      <div className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </div>
      <button
        className={styles.button}
        disabled={!hasNext}
        onClick={() => handleChangePage("next")}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
