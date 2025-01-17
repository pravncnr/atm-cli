export interface User {
  name: string;
  balance: number;
  owed: { [name: string]: number };
  owes: { [name: string]: number };
}

export class UserAccount {
  public users: Map<string, User> = new Map();

  getUser(name: string): User {
    if (!this.users.has(name)) {
      this.users.set(name, { name, balance: 0, owed: {}, owes: {} });
    }
    return this.users.get(name)!;
  }

  reset(): void {
    this.users.clear();
  }
}

