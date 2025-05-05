import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Copy, Trash2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { url } from "inspector";

interface SavedLink {
  id: number;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
}

export default function SavedLinks() {
  const [links, setLinks] = useState<SavedLink[]>([]);

  useEffect(() => {
    const savedLinks = JSON.parse(localStorage.getItem("shortLinks") || "[]");
    setLinks(savedLinks);
  }, []);

  const deleteLink = useCallback(async (id: number) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    setLinks(updatedLinks);
    localStorage.setItem("shortLinks", JSON.stringify(updatedLinks));
    try {
      await fetch(`http://localhost:8080/delete/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Link eliminado",
        description: "El link ha sido eliminado de tu lista",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Error fetching data. Description: ${error}`,
      });
      console.error(error);
    }
  }, [links]);

  const truncateUrl = useCallback((url: string, maxLength = 40) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  }, []);

  const renderedRows = useMemo(() => (
    links.map((link) => (
      <TableRow key={link.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span
              className="truncate max-w-[200px]"
              title={link.originalUrl}
            >
              {truncateUrl(link.originalUrl)}
            </span>
            <a
              href={link.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[150px]" title={link.shortUrl}>
              {truncateUrl(link.shortUrl, 25)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigator.clipboard.writeText(link.shortUrl)}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
        <TableCell>
          {formatDistanceToNow(new Date(link.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => deleteLink(link.id)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))
  ), [links, truncateUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Links Guardados</CardTitle>
        <CardDescription>Administra tus links acortados</CardDescription>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tienes links guardados. Genera algunos links primero.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL Original</TableHead>
                  <TableHead>Link Corto</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderedRows}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <Toaster />
    </Card>
  );
}
