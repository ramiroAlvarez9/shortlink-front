import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Copy, CheckCircle } from "lucide-react";
import { object, string, parse } from "valibot";
import { NEXT_BODY_SUFFIX } from "next/dist/lib/constants";

const IdSchema = object({
  id: string(),
});

export default function LinkGenerator() {
  const [url, setUrl] = useState({
    largeUrl: "",
    shortUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShortLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopied(false);
    if (!url.largeUrl) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL válida",
        variant: "destructive",
      });
      return;
    }
    console.log(
      "public variable: ",
      process.env.NEXT_PUBLIC_SHORTENER_SERVER_HOST,
    );
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SHORTENER_SERVER_HOST}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.largeUrl,
          }),
        },
      );
      const data = await response.json();
      const idData = parse(IdSchema, data);
      const newShortUrl = `${process.env.NEXT_PUBLIC_SHORTENER_SERVER_HOST}/${idData.id}`;
      setUrl((prevUrls) => ({ ...prevUrls, shortUrl: newShortUrl }));
      const savedLinks = JSON.parse(localStorage.getItem("shortLinks") || "[]");
      savedLinks.push({
        id: idData.id,
        originalUrl: url.largeUrl,
        shortUrl: newShortUrl,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("shortLinks", JSON.stringify(savedLinks));
      toast({
        title: "¡Link generado!",
        description: "Tu link corto ha sido creado y guardado",
      });
    } catch (error) {
      console.error("Catch error: ", error);
      toast({
        title: "Error",
        description: "Hubo un problema al generar el link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast({
        title: "¡Copiado!",
        description: "Link copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Short Link</CardTitle>
        <CardDescription>Enter a URL to generate a short link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generateShortLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Original URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very-long-path-you-want-to-shorten"
                value={url.largeUrl}
                onChange={(e) =>
                  setUrl((prevUrls) => ({
                    ...prevUrls,
                    largeUrl: e.target.value,
                  }))
                }
                required
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          {url.shortUrl && (
            <div className="space-y-2 pt-4">
              <Label htmlFor="shortUrl">Short Link</Label>
              <div className="flex gap-2">
                <Input
                  id="shortUrl"
                  value={url.shortUrl}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
      <Toaster />
    </Card>
  );
}
