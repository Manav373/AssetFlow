/**
 * @module Categories
 * @description Hierarchical asset category tree service to resolve parent-child relationship mappings.
 * @authors Developer 1, Antigravity
 * @status Completed
 * @collaboration Consumed by CategoriesController and used by assets endpoints.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getTree() {
    const categories = await this.prisma.assetCategory.findMany({
      where: { isActive: true },
    });

    // Map categories by ID for quick access
    const map = new Map<string, any>();
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    const tree: any[] = [];
    map.forEach((node) => {
      if (node.parentId) {
        const parent = map.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // If parent is not active or doesn't exist, treat as root
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return tree;
  }
}
