import { User, UserAccount } from "./user";

export class ATM {
  private currentUser: User | null = null;
  private userAccount: UserAccount;

  constructor() {
    this.userAccount = new UserAccount();
  }

  display() {
    // console.log(this.userAccount.users);
  }

  login(name: string) {
    this.currentUser = this.userAccount.getUser(name);
    console.log(`Hello, ${name}!`);
    this.displayBalance(this.currentUser);
  }

  logout() {
    if (!this.currentUser) {
      console.log("No user is currently logged in.");
      return;
    }
    console.log(`Goodbye, ${this.currentUser.name}!`);
    this.currentUser = null;
  }

  deposit(amount: number) {
    if (!this.validateCurrentUser()) return;

    const currentUser = this.currentUser!;
    let remaining = amount;

    // Clear debts if any
    remaining = this.clearDebt(currentUser, remaining);

    // Update the balance with the remaining amount
    this.updateBalance(currentUser, remaining);

    this.displayBalance(currentUser)
  }

  withdraw(amount: number) {
    if (!this.validateCurrentUser()) return;

    const currentUser = this.currentUser!;
    if (currentUser.balance < amount) {
      console.log("Insufficient funds.");
      return;
    }
    this.updateBalance(currentUser, -amount);
    console.log(`Your balance is $${currentUser.balance}`);
  }

  transfer(targetName: string, amount: number) {
    if (!this.validateCurrentUser()) return;

    const currentUser = this.currentUser!;
    if (currentUser.name === targetName) {
      console.log("Self-transfer is not allowed.");
      return;
    }

    const targetUser = this.userAccount.getUser(targetName);

    if (this.handleDebtTransfer(currentUser, targetUser, amount)) return;

    if (currentUser.balance >= amount) {
      this.executeFullTransfer(currentUser, targetUser, amount);
    } else {
      this.executePartialTransfer(currentUser, targetUser, amount);
    }
  }

  private validateCurrentUser(): boolean {
    if (!this.currentUser) {
      console.log("No user logged in.");
      return false;
    }
    return true;
  }

  private updateBalance(user: User, amount: number) {
    user.balance += amount;
  }

  private clearDebt(user: User, amount: number): number {
    let remaining = amount;

    for (const [creditor, debt] of Object.entries(user.owes)) {
      if (remaining <= 0) break;

      const payment = Math.min(debt, remaining);
      remaining -= payment;

      this.updateDebt(user, creditor, payment);
      console.log(`Transferred $${payment} to ${creditor}`);
    }

    return remaining;
  }

  private updateDebt(user: User, creditor: string, payment: number) {
    user.owes[creditor] -= payment;
    const creditorUser = this.userAccount.getUser(creditor);
    creditorUser.owed[user.name] -= payment;
    creditorUser.balance += payment;

    if (user.owes[creditor] === 0) delete user.owes[creditor];
    if (creditorUser.owed[user.name] === 0) delete creditorUser.owed[user.name];
  }

  private handleDebtTransfer(
      currentUser: User,
      targetUser: User,
      amount: number
  ): boolean {
    if (!currentUser.owed[targetUser.name]) return false;

    const debtAmount = currentUser.owed[targetUser.name];
    if (amount >= debtAmount) {
      this.settleFullDebt(currentUser, targetUser, amount - debtAmount);
    } else {
      this.settlePartialDebt(currentUser, targetUser, debtAmount - amount);
    }
    return true;
  }

  private settleFullDebt(
      currentUser: User,
      targetUser: User,
      remainingAmount: number
  ) {
    delete currentUser.owed[targetUser.name];
    delete targetUser.owes[currentUser.name];

    if (remainingAmount > 0) {
      this.updateBalance(currentUser, -remainingAmount);
      this.updateBalance(targetUser, remainingAmount);
    }

    console.log(`Transferred $${remainingAmount} to ${targetUser.name}`);
    this.displayBalance(currentUser);
  }

  private settlePartialDebt(
      currentUser: User,
      targetUser: User,
      remainingDebt: number
  ) {
    currentUser.owed[targetUser.name] = remainingDebt;
    targetUser.owes[currentUser.name] = remainingDebt;

    console.log(`Transferred part of the debt to ${targetUser.name}`);
    this.displayBalance(currentUser);
  }

  private executeFullTransfer(
      currentUser: User,
      targetUser: User,
      amount: number
  ) {
    this.updateBalance(currentUser, -amount);
    this.updateBalance(targetUser, amount);

    console.log(`Transferred $${amount} to ${targetUser.name}`);
    this.displayBalance(currentUser);
  }

  private executePartialTransfer(
      currentUser: User,
      targetUser: User,
      amount: number
  ) {
    const shortfall = amount - currentUser.balance;

    this.updateBalance(targetUser, currentUser.balance);
    currentUser.balance = 0;

    currentUser.owes[targetUser.name] = (currentUser.owes[targetUser.name] || 0) + shortfall;
    targetUser.owed[currentUser.name] = (targetUser.owed[currentUser.name] || 0) + shortfall;

    console.log(`Transferred $${amount - shortfall} to ${targetUser.name}`);
    this.displayBalance(currentUser);
  }

  private displayOwesAndOwed(user: User) {
    const owes = Object.entries(user.owes)
        .map(([name, amount]) => `$${amount} to ${name}`)
        .join(", ");
    const owed = Object.entries(user.owed)
        .map(([name, amount]) => `$${amount} from ${name}`)
        .join(", ");

    if (owes) console.log(`Owed ${owes}`);
    if (owed) console.log(`Owed ${owed}`);
  }

  private displayBalance(user: User) {
    console.log(`Your balance is $${user.balance}`);
    this.displayOwesAndOwed(user);
  }
}
