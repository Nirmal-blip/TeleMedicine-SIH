import { IsString, IsNumber, IsMongoId, Min } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  medicineId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsMongoId()
  medicineId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class RemoveFromCartDto {
  @IsMongoId()
  medicineId: string;
}
