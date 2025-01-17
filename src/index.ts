import * as readlineSync from "readline-sync";
import { ATM } from "./atm";
// import { ATM } from "./atmN";

const atm = new ATM();

function main() {
  console.log("Welcome to the ATM CLI!");
  while (true) {
    const command = readlineSync.question("> ");
    const [action, ...args] = command.split(" ");

    try {
      switch (action.toLowerCase()) {
        case "login":
          atm.login(args[0]);
          break;
        case "deposit":
          atm.deposit(parseFloat(args[0]));
          atm.display()
          break;
        case "withdraw":
          atm.withdraw(parseFloat(args[0]));
          atm.display()
          break;
        case "transfer":
          atm.transfer(args[0], parseFloat(args[1]));
          atm.display()
          break;
        case "logout":
          atm.logout();
          break;
        case "exit":
          console.log("Goodbye!");
          process.exit(0);
        default:
          console.log("Unknown command.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("An unknown error occurred.");
      }
    }
  }
}

main();

