"use client";

import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Menu, Package2, FileText, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export function DashboardSidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/documentos/facturas",
      icon: <FileText className="h-5 w-5" />,
      label: "Documentos",
      subItems: [
        {
          href: "/dashboard/documentos/facturas",
          label: "Facturas",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <SheetClose asChild>
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold mb-6"
              >
                <Package2 className="h-6 w-6" />
                <span>Negobi</span>
              </Link>
            </SheetClose>
            {links.map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="#" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span>Negobi</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-2">
          <div className="grid gap-1 px-2">
            {links.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
                {link.subItems && (
                  <div className="ml-8 mt-1 space-y-1">
                    {link.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                          pathname === subItem.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
