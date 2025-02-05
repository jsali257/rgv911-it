import AssignmentForm from "@/app/ui/dashboard/itemIssignment/itemAssignment";
import styles from "../../../ui/dashboard/inventory/inventory.module.css";
import { fetchProduct, getAssignmentsByModelNumber } from "@/app/lib/data";
import { unassignItem, updateItem } from "@/app/lib/actions";
import UnAssignmentButton from "@/app/ui/dashboard/unAssignButton/unAssignButton";

const SingleInventoryPage = async ({ params }) => {
  const { id } = params;
  const product = await fetchProduct(id);
  const result = await getAssignmentsByModelNumber(product.modelNumber);

  if (!result.success) {
    return <p>{result.error}</p>;
  }

  const assignments = result.assignments;

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2>Update Product</h2>
        <br></br>
        <form action={updateItem} className={styles.form}>
          <input type="hidden" name="id" value={product.id} />
          <label for="itemName">Item Name</label>
          <input
            type="text"
            name="itemName"
            placeholder={product.itemName}
            defaultValue={product.itemName}
          />
          <label for="modelNumber">Model Number</label>
          <input
            type="text"
            name="modelNumber"
            placeholder={product.modelNumber}
            defaultValue={product.modelNumber}
          />
          <label for="stock">Stock Number</label>
          <input
            type="number"
            name="stock"
            placeholder={product.stock}
            defaultValue={product.stock}
          />
          <button>Update Item</button>
        </form>
        <br></br>
        <br></br>
        <br></br>
        <AssignmentForm modelNumber={product.modelNumber} />
        <br></br>
        <br></br>
        <br></br>
        <h3>Assignments for {product.itemName}:</h3>

        <table className={styles.table}>
          <thead>
            <tr>
              <td>Serial Number</td>
              <td>Assigned To</td>
              <td>Agency</td>
              <td>Date</td>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <p>No assignments found for this model number.</p>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment._id}>
                  <td>{assignment.serialNumber}</td>
                  <td>{assignment.assignedTo}</td>
                  <td>{assignment.agency}</td>

                  <td>
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </td>

                  <td>
                    <div className={styles.buttons}>
                      <form action={unassignItem}>
                        <input
                          type="hidden"
                          name="assignmentId"
                          value={String(assignment._id)}
                        />

                        <UnAssignmentButton
                          className={`${styles.button} ${styles.delete}`}
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SingleInventoryPage;
