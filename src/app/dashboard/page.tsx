"use client";
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import * as React from "react";
import DropDown from '../components/dropdown';
import FileUploadComponent from '../components/dragndrop';
import { DatePickerWithRange } from '../components/calcandar';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { DateRange } from "react-day-picker";
import emailjs from '@emailjs/browser';

// const DashboardPage: React.FC = () => {
  export default function DashboardPage() {

  const [dropdownValue, setDropdownValue] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paymentAccount, setPaymentAccount] = React.useState("");
  const [merchant, setMerchant] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [dateRange, setDateRange] = React.useState<DateRange>();

  const encodeFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const sendEmail = async (formData: any) => {
    try {
      const templateParams = {
        // to_email: 'nationalhighway414@gmail.com',
        reimbursementType: formData.reimbursementType,
        amount: formData.amount,
        paymentAccount: formData.paymentAccount,
        merchant: formData.merchant,
        description: formData.description,
        dateRange: JSON.stringify(formData.dateRange),
      };

      await emailjs.send(
        'service_6plkyyh',
        'template_e9i0o6d',
        templateParams,
        'vWA2-'
        // 'vWA2-qSD7rUVFVSqa'
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async () => {
    const formData: { [key: string]: any } = {
      category: dropdownValue,
      amount,
      account_number: paymentAccount,
      merchant_name: merchant,
      description,
      date: dateRange,
      files: []
      // manager_name: manager
    };

    const filePromises = uploadedFiles.map(async (file) => {
      const base64File = await encodeFileToBase64(file);
      formData.files.push({ name: file.name, data: base64File });
    });

    await Promise.all(filePromises);

    try {
      const response = await fetch('http://localhost:8081/api/claim/submitclaim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setDropdownValue("");
        setAmount("");
        setPaymentAccount("");
        setMerchant("");
        setDescription("");
        setUploadedFiles([]);
        setDateRange(undefined);
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      await sendEmail(formData);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="sticky top-0 z-50 w-full">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden mt-[96px]">
        <Sidebar />
        <div className="flex flex-col w-full p-4">
          <div className="flex flex-col items-start mb-4">
            <DropDown value={dropdownValue} onChange={setDropdownValue} />
          </div>
          <div className="flex flex-1">
            <div className="flex flex-col flex-1">
              <DatePickerWithRange onDateChange={setDateRange} />
              <div className="mt-8 space-y-8">
                <Input
                  type="number"
                  placeholder="Total amount(INR)"
                  className="ml-[200px] w-[250px] h-9 p-2 border border-gray-300 rounded"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="To Reimburse Payment account"
                  className="ml-[200px] w-[250px] h-9 p-2 border border-gray-300 rounded"
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Merchant"
                  className="ml-[200px] w-[250px] h-9 p-2 border border-gray-300 rounded"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  className="ml-[200px] w-[250px] h-24 p-2 border border-gray-300 rounded"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <FileUploadComponent setUploadedFiles={setUploadedFiles} />
          </div>
          <hr className='-translate-y-5' />
          <div className='flex justify-center'>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
