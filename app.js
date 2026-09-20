console.log("Task Manager CLI");
console.log("Application started!");

const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let tasks = [];

// Load tasks
if (fs.existsSync("tasks.json")) {
    const data = fs.readFileSync("tasks.json", "utf8");
    tasks = JSON.parse(data);
}

console.log("");
console.log("    TASK MANAGER CLI");
console.log("");

console.log("\n1. Create Task");
console.log("2. View Tasks");
console.log("3. Update Task");
console.log("4. Delete Task");
console.log("5. Search Task");
console.log("6. Filter Tasks");
console.log("7. Exit");

rl.question("\nChoose an option: ", function(choice) {

    // CREATE
    if (choice == "1") {

        rl.question("Enter task title: ", function(title) {

            const newId =
                tasks.length > 0 ?
                Math.max(...tasks.map(task => task.id)) + 1 :
                1;

            const task = {
                id: newId,
                title: title,
                completed: false
            };

            tasks.push(task);

            fs.writeFileSync(
                "tasks.json",
                JSON.stringify(tasks, null, 2)
            );

            console.log("\nTask created successfully!");
            console.log(task);

            rl.close();
        });

    }

    // VIEW
    else if (choice == "2") {

        console.log("\n==== MY TASKS ====");

        if (tasks.length === 0) {

            console.log("No tasks found.");

        } else {

            tasks.forEach(function(task) {

                console.log(
                    task.id +
                    ". " +
                    task.title +
                    " [" +
                    (task.completed ? "Complete" : "Pending") +
                    "]"
                );

            });

        }

        rl.close();

    }

    // UPDATE
    else if (choice == "3") {

        rl.question("Enter task ID to update: ", function(id) {

            const task = tasks.find(function(task) {
                return task.id === Number(id);
            });

            if (task) {
                // change on branch1
                task.completed = !task.completed;

                fs.writeFileSync(
                    "tasks.json",
                    JSON.stringify(tasks, null, 2)
                );

                console.log("\nTask updated successfully!");

            } else {

                console.log("\nTask not found.");

            }

            rl.close();

        });

    }

    // DELETE
    else if (choice == "4") {

        rl.question("Enter task ID to delete: ", function(id) {

            const index = tasks.findIndex(function(task) {

                return task.id === Number(id);

            });

            if (index !== -1) {

                const deletedTask = tasks.splice(index, 1);

                fs.writeFileSync(
                    "tasks.json",
                    JSON.stringify(tasks, null, 2)
                );

                console.log("\nTask deleted successfully!");
                console.log("Deleted: " + deletedTask[0].title);

            } else {

                console.log("\nTask not found.");

            }

            rl.close();

        });

    }

    // SEARCH
    else if (choice == "5") {

        rl.question("Enter keyword: ", function(keyword) {

            const results = tasks.filter(function(task) {
                // change on branch 2
                return task.title
                    .toLowerCase()
                    .includes(keyword.trim().toLowerCase());

            });

            if (results.length === 0) {

                console.log("\nNo matching tasks found.");

            } else {

                console.log("\n=== SEARCH RESULTS ===");

                results.forEach(function(task) {

                    console.log(
                        task.id +
                        ". " +
                        task.title +
                        " [" +
                        (task.completed ? "Complete" : "Pending") +
                        "]"
                    );

                });

            }

            rl.close();

        });

    }

    // FILTER
    else if (choice == "6") {

        console.log("\n1. Completed");
        console.log("2. Pending");

        rl.question("Choose filter: ", function(option) {

            let filtered = [];

            if (option == "1") {

                filtered = tasks.filter(function(task) {

                    return task.completed;

                });

            } else if (option == "2") {

                filtered = tasks.filter(function(task) {

                    return !task.completed;

                });

            } else {

                console.log("Invalid filter.");
                rl.close();
                return;

            }

            if (filtered.length === 0) {

                console.log("No tasks found.");

            } else {

                console.log("\n==== FILTER RESULTS ====");

                filtered.forEach(function(task) {

                    console.log(
                        task.id +
                        ". " +
                        task.title +
                        " [" +
                        (task.completed ? "Complete" : "Pending") +
                        "]"
                    );

                });

            }

            rl.close();

        });

    }

    // EXIT
    else if (choice == "7") {

        console.log("\nThank you for using Task Manager!");
        rl.close();

    }

    // INVALID OPTION
    else {

        console.log("\nInvalid option.");
        rl.close();

    }

});