"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Reply,
  Trash2,
  Archive,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Mail,
  User,
  Calendar,
  MapPin,
  Phone,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Types
interface Submission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type:
    | "GUESTBOOK"
    | "FEEDBACK"
    | "COMPLAINT"
    | "INQUIRY"
    | "BUSINESS"
    | "VOLUNTEER"
    | "OTHER";
  status: "PENDING" | "READ" | "REPLIED" | "CLOSED" | "ARCHIVED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  response?: string;
  responseBy?: string;
  responseAt?: string;
  readAt?: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  handlerId?: string;
  handler?: {
    id: string;
    name: string;
    email: string;
  };
}

interface SubmissionStats {
  PENDING: number;
  READ: number;
  REPLIED: number;
  CLOSED: number;
  ARCHIVED: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data: {
    submissions: Submission[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    stats: SubmissionStats;
  };
}

const SUBMISSION_TYPES = {
  GUESTBOOK: "Buku Tamu",
  FEEDBACK: "Saran & Masukan",
  COMPLAINT: "Keluhan",
  INQUIRY: "Pertanyaan",
  BUSINESS: "Kerjasama Bisnis",
  VOLUNTEER: "Kegiatan Volunteer",
  OTHER: "Lainnya",
};

const SUBMISSION_STATUS = {
  PENDING: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800" },
  READ: { label: "Dibaca", color: "bg-blue-100 text-blue-800" },
  REPLIED: { label: "Dibalas", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "Ditutup", color: "bg-gray-100 text-gray-800" },
  ARCHIVED: { label: "Diarsip", color: "bg-purple-100 text-purple-800" },
};

const SUBMISSION_PRIORITY = {
  LOW: { label: "Rendah", color: "bg-gray-100 text-gray-600" },
  NORMAL: { label: "Normal", color: "bg-blue-100 text-blue-600" },
  HIGH: { label: "Tinggi", color: "bg-orange-100 text-orange-600" },
  URGENT: { label: "Mendesak", color: "bg-red-100 text-red-600" },
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats>({
    PENDING: 0,
    READ: 0,
    REPLIED: 0,
    CLOSED: 0,
    ARCHIVED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Modal states
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<Submission | null>(null);

  // Form states
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
      });

      const response = await fetch(`/api/submissions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");

      const data: ApiResponse = await response.json();

      if (data.success) {
        setSubmissions(data.data.submissions);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("Gagal memuat data submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, searchTerm, statusFilter, typeFilter, priorityFilter]);

  // Mark as read
  const markAsRead = async (submission: Submission) => {
    if (submission.readAt) return; // Already read

    try {
      const response = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission.id,
          markAsRead: true,
        }),
      });

      if (response.ok) {
        fetchSubmissions(); // Refresh data
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Handle view details
  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsDetailModalOpen(true);
    markAsRead(submission);
  };

  // Handle reply
  const handleReply = (submission: Submission) => {
    setSelectedSubmission(submission);
    setResponseText(submission.response || "");
    setIsResponseModalOpen(true);
  };

  // Submit response
  const handleSubmitResponse = async () => {
    if (!selectedSubmission || !responseText.trim()) return;

    try {
      setIsSubmittingResponse(true);
      const response = await fetch("/api/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSubmission.id,
          response: responseText,
          handlerId: "current-user-id", // Replace with actual user ID from context
        }),
      });

      if (response.ok) {
        setIsResponseModalOpen(false);
        setResponseText("");
        fetchSubmissions(); // Refresh data
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Handle delete
  const handleDelete = (submission: Submission) => {
    setSubmissionToDelete(submission);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;

    try {
      const response = await fetch(
        `/api/submissions?id=${submissionToDelete.id}&action=delete`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setSubmissionToDelete(null);
        fetchSubmissions(); // Refresh data
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
    }
  };

  // Handle archive
  const handleArchive = async (submission: Submission) => {
    try {
      const response = await fetch(
        `/api/submissions?id=${submission.id}&action=archive`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchSubmissions(); // Refresh data
      }
    } catch (error) {
      console.error("Error archiving submission:", error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID");
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "READ":
        return <Eye className="h-4 w-4" />;
      case "REPLIED":
        return <CheckCircle className="h-4 w-4" />;
      case "CLOSED":
        return <CheckCircle className="h-4 w-4" />;
      case "ARCHIVED":
        return <Archive className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Terjadi Kesalahan
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button
          onClick={() => {
            setError(null);
            fetchSubmissions();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Pesan & Submission
          </h2>
          <p className="text-gray-600">
            Kelola pesan masuk dari pengunjung website
          </p>
        </div>
        <Button onClick={fetchSubmissions} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.PENDING || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Dibaca</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.READ || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ditutup</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.CLOSED || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Diarsip</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.ARCHIVED || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Cari</Label>
              <Input
                id="search"
                placeholder="Cari berdasarkan nama, email, atau pesan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="PENDING">Menunggu</SelectItem>
                    <SelectItem value="READ">Dibaca</SelectItem>
                    <SelectItem value="REPLIED">Dibalas</SelectItem>
                    <SelectItem value="CLOSED">Ditutup</SelectItem>
                    <SelectItem value="ARCHIVED">Diarsip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipe</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {Object.entries(SUBMISSION_TYPES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioritas</Label>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Prioritas</SelectItem>
                    <SelectItem value="LOW">Rendah</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">Tinggi</SelectItem>
                    <SelectItem value="URGENT">Mendesak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Daftar Pesan
            {!loading && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({submissions.length} pesan)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Memuat data pesan...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ||
                statusFilter !== "all" ||
                typeFilter !== "all" ||
                priorityFilter !== "all"
                  ? "Tidak ada pesan yang sesuai dengan filter"
                  : "Belum ada pesan masuk"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pengirim</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Subjek</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioritas</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow
                        key={submission.id}
                        className={
                          !submission.readAt
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : ""
                        }
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{submission.name}</p>
                            <p className="text-sm text-gray-500">
                              {submission.email}
                            </p>
                            {submission.phone && (
                              <p className="text-sm text-gray-500">
                                {submission.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {SUBMISSION_TYPES[submission.type] ||
                              submission.type}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">
                              {submission.subject || "Tanpa subjek"}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {submission.message}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              SUBMISSION_STATUS[submission.status]?.color
                            }
                          >
                            {getStatusIcon(submission.status)}
                            <span className="ml-1">
                              {SUBMISSION_STATUS[submission.status]?.label ||
                                submission.status}
                            </span>
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              SUBMISSION_PRIORITY[submission.priority]?.color
                            }
                          >
                            {SUBMISSION_PRIORITY[submission.priority]?.label ||
                              submission.priority}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm">
                          {formatDate(submission.createdAt)}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(submission)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleArchive(submission)}
                                className="text-orange-600"
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Arsipkan
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(submission)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm">
                    Halaman {currentPage} dari {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesan</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang pesan yang diterima
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nama Pengirim</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{selectedSubmission.name}</span>
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{selectedSubmission.email}</span>
                  </div>
                </div>
              </div>

              {selectedSubmission.phone && (
                <div>
                  <Label>Nomor Telepon</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{selectedSubmission.phone}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipe Pesan</Label>
                  <Badge variant="outline" className="mt-1">
                    {SUBMISSION_TYPES[selectedSubmission.type] ||
                      selectedSubmission.type}
                  </Badge>
                </div>
                <div>
                  <Label>Prioritas</Label>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${
                      SUBMISSION_PRIORITY[selectedSubmission.priority]?.color
                    }`}
                  >
                    {SUBMISSION_PRIORITY[selectedSubmission.priority]?.label ||
                      selectedSubmission.priority}
                  </Badge>
                </div>
              </div>

              {selectedSubmission.subject && (
                <div>
                  <Label>Subjek</Label>
                  <p className="mt-1 font-medium">
                    {selectedSubmission.subject}
                  </p>
                </div>
              )}

              <div>
                <Label>Pesan</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>
              </div>

              {selectedSubmission.response && (
                <div>
                  <Label>Balasan</Label>
                  <div className="mt-1 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="whitespace-pre-wrap">
                      {selectedSubmission.response}
                    </p>
                    {selectedSubmission.responseAt && (
                      <p className="text-sm text-gray-500 mt-2">
                        Dibalas pada {formatDate(selectedSubmission.responseAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t pt-4">
                <Label>Informasi Tambahan</Label>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-500">
                  <div>
                    <p>Tanggal dikirim:</p>
                    <p className="font-medium">
                      {formatDate(selectedSubmission.createdAt)}
                    </p>
                  </div>
                  {selectedSubmission.readAt && (
                    <div>
                      <p>Dibaca pada:</p>
                      <p className="font-medium">
                        {formatDate(selectedSubmission.readAt)}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.ipAddress && (
                    <div>
                      <p>IP Address:</p>
                      <p className="font-medium">
                        {selectedSubmission.ipAddress}
                      </p>
                    </div>
                  )}
                  {selectedSubmission.source && (
                    <div>
                      <p>Sumber:</p>
                      <p className="font-medium">{selectedSubmission.source}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Response Modal */}
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.response ? "Edit Balasan" : "Balas Pesan"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission &&
                `Membalas pesan dari ${selectedSubmission.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSubmission && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Pesan asli:</p>
                <p className="text-sm">{selectedSubmission.message}</p>
              </div>
            )}

            <div>
              <Label htmlFor="response">Balasan Anda</Label>
              <Textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Tulis balasan Anda di sini..."
                rows={6}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResponseModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!responseText.trim() || isSubmittingResponse}
            >
              {isSubmittingResponse ? "Mengirim..." : "Kirim Balasan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pesan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pesan dari{" "}
              {submissionToDelete?.name}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
