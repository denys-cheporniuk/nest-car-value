import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './reports.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { User } from '../users/users.entity';
import { GetEstimateDto } from './dto/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private repository: Repository<Report>,
  ) {}

  async create(values: CreateReportDto, user: User): Promise<Report> {
    const report = await this.repository.create(values);
    report.user = user;

    return this.repository.save(report);
  }

  async changeApproval(id: number, approved: boolean): Promise<Report> {
    const report = await this.repository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }

    report.approved = approved;
    return this.repository.save(report);
  }

  async createEstimate(values: GetEstimateDto): Promise<Report[]> {
    const { make, model, mileage, year, lat, lng } = values;

    return this.repository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
