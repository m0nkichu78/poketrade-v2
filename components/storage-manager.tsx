"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Upload, Trash2, Download, FolderPlus, File } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface StorageFile {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: any
  size: number
}

interface StorageManagerProps {
  bucketName: string
  allowedFileTypes?: string[]
  maxFileSize?: number // en Mo
}

export function StorageManager({ bucketName, allowedFileTypes = ["image/*"], maxFileSize = 5 }: StorageManagerProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [files, setFiles] = useState<StorageFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [currentFolder, setCurrentFolder] = useState<string>("")
  const [newFolderName, setNewFolderName] = useState<string>("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)

  // Charger les fichiers
  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.storage.from(bucketName).list(currentFolder, {
        sortBy: { column: "name", order: "asc" },
      })

      if (error) throw error

      setFiles(data || [])
    } catch (error: any) {
      console.error("Error loading files:", error)
      toast({
        title: "Erreur",
        description: error.message || "Échec du chargement des fichiers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [currentFolder, bucketName])

  // Gérer le changement de dossier
  const handleFolderChange = (folderName: string) => {
    let newPath = currentFolder

    if (folderName === "..") {
      // Remonter d'un niveau
      const parts = currentFolder.split("/")
      parts.pop()
      newPath = parts.join("/")
    } else {
      // Descendre d'un niveau
      newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName
    }

    setCurrentFolder(newPath)
  }

  // Créer un nouveau dossier
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    setIsCreatingFolder(true)
    try {
      // Pour créer un dossier dans Supabase Storage, on crée un fichier vide avec un chemin se terminant par "/"
      const folderPath = currentFolder ? `${currentFolder}/${newFolderName}/.keep` : `${newFolderName}/.keep`

      const { error } = await supabase.storage.from(bucketName).upload(folderPath, new Blob([]), {
        contentType: "application/json",
        upsert: false,
      })

      if (error) throw error

      toast({
        title: "Dossier créé",
        description: `Le dossier "${newFolderName}" a été créé avec succès`,
      })

      setNewFolderName("")
      setShowNewFolderDialog(false)
      loadFiles()
    } catch (error: any) {
      console.error("Error creating folder:", error)
      toast({
        title: "Erreur",
        description: error.message || "Échec de la création du dossier",
        variant: "destructive",
      })
    } finally {
      setIsCreatingFolder(false)
    }
  }

  // Télécharger un fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    const isAllowedType = allowedFileTypes.some((type) => {
      if (type.endsWith("/*")) {
        const mainType = type.split("/")[0]
        return file.type.startsWith(`${mainType}/`)
      }
      return file.type === type
    })

    if (!isAllowedType) {
      toast({
        title: "Type de fichier non valide",
        description: `Types de fichiers autorisés: ${allowedFileTypes.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Vérifier la taille du fichier
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: `La taille maximale autorisée est de ${maxFileSize} Mo`,
        variant: "destructive",
      })
      return
    }

    setUploadFile(file)
  }

  // Télécharger le fichier
  const uploadFileToStorage = async () => {
    if (!uploadFile) return

    setIsUploading(true)
    try {
      const filePath = currentFolder ? `${currentFolder}/${uploadFile.name}` : uploadFile.name

      const { error } = await supabase.storage.from(bucketName).upload(filePath, uploadFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      toast({
        title: "Fichier téléchargé",
        description: `Le fichier "${uploadFile.name}" a été téléchargé avec succès`,
      })

      setUploadFile(null)
      loadFiles()
    } catch (error: any) {
      console.error("Error uploading file:", error)
      toast({
        title: "Erreur",
        description: error.message || "Échec du téléchargement du fichier",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Supprimer un fichier
  const handleDeleteFile = async (fileName: string) => {
    try {
      const filePath = currentFolder ? `${currentFolder}/${fileName}` : fileName

      const { error } = await supabase.storage.from(bucketName).remove([filePath])

      if (error) throw error

      toast({
        title: "Fichier supprimé",
        description: `Le fichier "${fileName}" a été supprimé avec succès`,
      })

      loadFiles()
    } catch (error: any) {
      console.error("Error deleting file:", error)
      toast({
        title: "Erreur",
        description: error.message || "Échec de la suppression du fichier",
        variant: "destructive",
      })
    }
  }

  // Télécharger un fichier
  const handleDownloadFile = async (fileName: string) => {
    try {
      const filePath = currentFolder ? `${currentFolder}/${fileName}` : fileName

      const { data, error } = await supabase.storage.from(bucketName).download(filePath)

      if (error) throw error

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Téléchargement réussi",
        description: `Le fichier "${fileName}" a été téléchargé avec succès`,
      })
    } catch (error: any) {
      console.error("Error downloading file:", error)
      toast({
        title: "Erreur",
        description: error.message || "Échec du téléchargement du fichier",
        variant: "destructive",
      })
    }
  }

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionnaire de stockage - {bucketName}</CardTitle>
        <CardDescription>Gérez les fichiers stockés dans le bucket {bucketName}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentFolder("")} disabled={!currentFolder}>
              Racine
            </Button>
            {currentFolder && (
              <Button variant="outline" size="sm" onClick={() => handleFolderChange("..")}>
                Niveau supérieur
              </Button>
            )}
            <span className="text-sm text-muted-foreground">{currentFolder ? `/${currentFolder}` : "/"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Nouveau dossier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau dossier</DialogTitle>
                  <DialogDescription>
                    Entrez le nom du nouveau dossier à créer dans {currentFolder ? `/${currentFolder}` : "/"}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="folder-name">Nom du dossier</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nouveau dossier"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateFolder} disabled={isCreatingFolder || !newFolderName.trim()}>
                    {isCreatingFolder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <div>
                  <Upload className="mr-2 h-4 w-4" />
                  Télécharger un fichier
                </div>
              </Button>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept={allowedFileTypes.join(",")}
              />
            </Label>
          </div>
        </div>

        {/* Aperçu du fichier à télécharger */}
        {uploadFile && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{uploadFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadFile.size)} • {uploadFile.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setUploadFile(null)} disabled={isUploading}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={uploadFileToStorage} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Téléchargement...
                      </>
                    ) : (
                      "Télécharger"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des fichiers */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucun fichier trouvé dans ce dossier
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {file.metadata?.mimetype ? (
                            <File className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <FolderPlus className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{file.metadata?.mimetype || "Dossier"}</TableCell>
                      <TableCell>{file.metadata?.size ? formatFileSize(file.metadata.size) : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {file.metadata?.mimetype ? (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(file.name)}>
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Télécharger</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.name)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleFolderChange(file.name)}>
                              Ouvrir
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
