import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from '../schemas/medicine.schema';
import { CreateMedicineDto, UpdateMedicineDto, SearchMedicinesDto } from '../dto/medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    const createdMedicine = new this.medicineModel(createMedicineDto);
    return createdMedicine.save();
  }

  async findAll(searchDto: SearchMedicinesDto): Promise<{
    medicines: Medicine[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      prescriptionRequired,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = searchDto;

    // Build filter object
    const filter: any = { isActive: true };

    // Text search
    if (query) {
      filter.$text = { $search: query };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Prescription requirement filter
    if (prescriptionRequired !== undefined) {
      filter.prescriptionRequired = prescriptionRequired;
    }

    // Build sort object
    const sort: any = {};
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    
    switch (sortBy) {
      case 'price':
        sort.price = sortDirection;
        break;
      case 'rating':
        sort.rating = sortDirection;
        break;
      case 'popularity':
        sort.salesCount = sortDirection;
        break;
      case 'name':
      default:
        sort.name = sortDirection;
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [medicines, total] = await Promise.all([
      this.medicineModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.medicineModel.countDocuments(filter).exec(),
    ]);

    return {
      medicines,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Medicine> {
    const medicine = await this.medicineModel.findById(id).exec();
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }
    return medicine;
  }

  async findByIds(ids: string[]): Promise<Medicine[]> {
    return this.medicineModel.find({ _id: { $in: ids }, isActive: true }).exec();
  }

  async update(id: string, updateMedicineDto: UpdateMedicineDto): Promise<Medicine> {
    const medicine = await this.medicineModel
      .findByIdAndUpdate(id, updateMedicineDto, { new: true })
      .exec();
    
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }
    
    return medicine;
  }

  async remove(id: string): Promise<void> {
    const result = await this.medicineModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();
    
    if (!result) {
      throw new NotFoundException('Medicine not found');
    }
  }

  async getCategories(): Promise<string[]> {
    return this.medicineModel.distinct('category', { isActive: true }).exec();
  }

  async getFeatured(): Promise<Medicine[]> {
    return this.medicineModel
      .find({ isActive: true, isFeatured: true })
      .sort({ salesCount: -1 })
      .limit(10)
      .exec();
  }

  async updateStock(id: string, quantity: number): Promise<Medicine> {
    const medicine = await this.medicineModel.findById(id).exec();
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    if (medicine.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    medicine.stock -= quantity;
    medicine.salesCount += quantity;
    return medicine.save();
  }

  async restoreStock(id: string, quantity: number): Promise<Medicine> {
    const medicine = await this.medicineModel.findById(id).exec();
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    medicine.stock += quantity;
    medicine.salesCount -= quantity;
    return medicine.save();
  }

  async updateRating(id: string, newRating: number): Promise<Medicine> {
    const medicine = await this.medicineModel.findById(id).exec();
    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    // Calculate new average rating
    const totalRating = medicine.rating * medicine.reviewCount + newRating;
    medicine.reviewCount += 1;
    medicine.rating = totalRating / medicine.reviewCount;

    return medicine.save();
  }

  async searchSuggestions(query: string): Promise<string[]> {
    const medicines = await this.medicineModel
      .find(
        { 
          $text: { $search: query },
          isActive: true 
        },
        { name: 1, genericName: 1 }
      )
      .limit(10)
      .exec();

    const suggestions = medicines.flatMap(med => [med.name, med.genericName]);
    return [...new Set(suggestions)]; // Remove duplicates
  }
}
