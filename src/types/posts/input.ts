export type CreateNewPostType = {
    "title": string,
    "shortDescription": string,
    "content": string,
    "blogId": string
}

export type CreateNewPostForBlogType= {
    "title": string,
    "shortDescription": string,
    "content": string,
}

export type UpdatePostType= {
    "title": string,
    "shortDescription": string,
    "content": string
}

export type postQuerySortData = {
    pageSize?: number,
    pageNumber?: number,
    sortBy?: string,
    sortDirection?: string,
    searchNameTerm?: string,
}
