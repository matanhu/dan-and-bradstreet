-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
