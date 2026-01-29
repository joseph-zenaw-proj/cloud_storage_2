"use client"

import React, { useEffect, useState } from "react"

import Image from "next/image"
import { Input } from "@/components/ui/input"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getFiles } from "@/lib/actions/file.actions"
import { Models } from "node-appwrite"
import Thumbnail from "@/components/Thumbnail"
import FormattedDateTime from "@/components/FormattedDateTime"
import { useDebounce } from "use-debounce"

const Search = () => {
  const [query, setQuery] = useState("")
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("query") || ""
  const [results, setResults] = useState<Models.Document[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const path = usePathname()
  const [debouncedQuery] = useDebounce(query, 100)

  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length === 0) {
        setResults([])
        setOpen(false)
        return router.push(path.replace(searchParams.toString(), ""))
      }

      const files = await getFiles({ types: [], searchText: debouncedQuery })
      setResults(files.documents)
      setOpen(true)
    }

    fetchFiles()
  }, [debouncedQuery])

  useEffect(() => {
    if (!searchQuery) {
      setQuery("")
    }
  }, [searchQuery])

  const handleClickItem = (file: Models.Document) => {
    setOpen(false)
    setResults([])

    // Determine the correct route based on the type
    let targetPath = ""

    if (file.type === "video" || file.type === "audio") {
      targetPath = "media"
    } else if (file.type === "documents") {
      // If it's already "documents", don't add another 's'
      targetPath = "documents"
    } else {
      // For "image" or "other", add the 's'
      targetPath = `${file.type}s`
    }

    router.push(`/${targetPath}?query=${query}`)
  }

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  className="flex items-center justify-between"
                  key={file.$id}
                  onClick={() => handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>

                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Search
