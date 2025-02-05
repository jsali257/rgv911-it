import Link from "next/link";
import styles from "@/app/ui/dashboard/tickets/tickets.module.css";
import Search from "@/app/ui/dashboard/search/search";
import { fetchProducts } from "@/app/lib/data";
const InventoryPage = async () => {
  const { products } = await fetchProducts();
  //   const { stock } = await getStockCount();
  console.log(products, "sdsd");
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for an item..." />
        <Link href="/dashboard/inventory/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Item</td>
            <td>Model Number</td>
            <td>Stock</td>
            <td>Created Date</td>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.itemName}</td>
              <td>{product.modelNumber}</td>
              <td>{product.stock}</td>
              <td>{product.createdAt?.toString().slice(4, 16)}</td>

              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/inventory/${product.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  <form>
                    <input type="hidden" name="id" value={product.id} />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
