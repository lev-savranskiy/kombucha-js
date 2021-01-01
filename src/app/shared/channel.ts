export const channels = [
    {description: 'Retail Only', id: 'RETAIL'},
    {description: 'Telesales Only', id: 'TELESALES'},
    {description: 'Aggregate', id: 'AGGREGATE'}
];

export class Channel {
    id = channels[0].id;
    description = channels[0].description;
}
