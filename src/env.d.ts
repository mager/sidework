declare namespace App {
  interface Locals {
    account?: { github_id:string; login:string; email:string; status:string; email_updates:boolean; created_at:unknown } | null;
    hasAccess?:boolean;
  }
}
