import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Feedback } from "./models/feedback.entity";

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>
    ) {
    }

    async all(): Promise<Feedback[]> {
        const all = await this.feedbackRepository.find();
        all.forEach(feedback => {
            delete feedback.user;
        });
        return all;
    }

    async allProcessed(): Promise<Feedback[]> {
        const all = await this.feedbackRepository.find({ where: { processed: true } });
        all.forEach(feedback => {
            delete feedback.user;
        });
        return all;
    }

    async allUnprocessed(): Promise<Feedback[]> {
        const all = await this.feedbackRepository.find({ where: { processed: false } });
        all.forEach(feedback => {
            delete feedback.user;
        });
        return all;
    }

    async findOne(id: number): Promise<Feedback> {
        return this.feedbackRepository.findOne({ where: { id: id } });
    }

    async create(data: Partial<Feedback>): Promise<Partial<Feedback>> {
        const feedback = await this.feedbackRepository.save(data);
        console.log("Created feedback :", feedback);
        return {
            id: feedback.id,
            type: feedback.type,
            feedback: feedback.feedback,
            user_id: feedback.user_id,
            date: feedback.date,
            processed: feedback.processed,
            processed_date: feedback.processed_date
        };
    }

    async process(id: number): Promise<Partial<Feedback>> {
        const feedback = await this.feedbackRepository.findOne({ where: { id: id } });
        feedback.processed = true;
        feedback.processed_date = new Date();
        await this.feedbackRepository.save(feedback);
        console.log("Processed feedback :", feedback);
        return {
            id: feedback.id,
            type: feedback.type,
            feedback: feedback.feedback,
            user_id: feedback.user_id,
            date: feedback.date,
            processed: feedback.processed,
            processed_date: feedback.processed_date
        };
    }

    async unprocess(id: number): Promise<Partial<Feedback>> {
        const feedback = await this.feedbackRepository.findOne({ where: { id: id } });
        feedback.processed = false;
        feedback.processed_date = null;
        await this.feedbackRepository.save(feedback);
        console.log("Unprocessed feedback :", feedback);
        return {
            id: feedback.id,
            type: feedback.type,
            feedback: feedback.feedback,
            user_id: feedback.user_id,
            date: feedback.date,
            processed: feedback.processed,
            processed_date: feedback.processed_date
        };
    }

    async delete(id: number) {
        console.log("Deleted feedback ", id);
        return this.feedbackRepository.delete(id);
    }
}
