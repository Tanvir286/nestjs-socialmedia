import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationService {

  //  Offset Pagination
  async paginateOffset<T>(
    prisma: any,
    modelName: string,
    {
      where = {},
      include = {},
      orderBy = { createdAt: 'asc' },
      page = 1,
      limit = 10,
      baseUrl,
      endpoint,
      mapData,
    }: any,
  ) {
    const skip = (page - 1) * limit;
    const total = await prisma[modelName].count({ where });
    const totalPages = Math.ceil(total / limit);

    const allUrl = `${baseUrl}${endpoint}?limit=${limit}`;

    const items = await prisma[modelName].findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    });

    return {
      meta: { total, page, limit, totalPages },
      links: {
        first: `${allUrl}&page=1`,
        last: `${allUrl}&page=${totalPages}`,
        next: page < totalPages ? `${allUrl}&page=${page + 1}` : null,
        previous: page > 1 ? `${allUrl}&page=${page - 1}` : null,
      },
      data: mapData ? items.map(mapData) : items,
    };
  }

  // Cursor Pagination
  async paginateCursor<T>(
    prisma: any,
    modelName: string,
    {
      where = {},
      include = {},
      orderBy = { createdAt: 'desc' },
      cursor,
      take = 10,
      mapData,
    }: any,
  ) {
    const items = await prisma[modelName].findMany({
      where,
      include,
      orderBy,
      take: take,
      skip: cursor ? 1 : 0, 
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

    return {
      meta: { take, nextCursor },
      data: mapData ? items.map(mapData) : items,
    };
  }
}
